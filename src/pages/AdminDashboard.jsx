import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useClientData } from "../hooks/useClientData";
import {
  formatHeightWithFeetInches,
  formatDate,
  formatLbsWithKg,
  formatWeightWithKg,
  getComputedHealth,
  getLatestMeasurement,
  getTotalFatReduction,
  getWellnessTier,
  normalizeGender,
} from "../data/clientMetrics";

const tabs = ["All Members", "Male", "Female", "Most Progress", "Recent Activity"];

const columns = [
  { key: "name", label: "Member Name" },
  { key: "gender", label: "Gender" },
  { key: "age", label: "Age" },
  { key: "height", label: "Height" },
  { key: "assessments", label: "Assessments" },
  { key: "weight", label: "Latest Weight (lbs / kg)" },
  { key: "fat", label: "Body Fat %" },
  { key: "tier", label: "Wellness Tier" },
  { key: "lastDate", label: "Last Assessment Date" },
];

function getSortValue(client, key) {
  const latest = getLatestMeasurement(client);
  if (key === "name") return client.name || "";
  if (key === "gender") return normalizeGender(client.gender);
  if (key === "age") return client.age || 0;
  if (key === "height") return client.height || "";
  if (key === "assessments") return client.measurements.length;
  if (key === "weight") return latest?.weight_lbs || 0;
  if (key === "fat") return latest?.fat_pct || 0;
  if (key === "tier") return getWellnessTier(latest?.physique_rating || 0).label;
  if (key === "lastDate") return latest?.date || "1970-01-01";
  return "";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { all, totalSessions } = useClientData();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState(tabs[0]);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const statBackgrounds = useMemo(() => {
    const palette = [
      "bg-[#141a20]",
      "bg-[#1a1520]",
      "bg-[#152018]",
      "bg-[#1f1914]",
      "bg-[#171c24]",
      "bg-[#1b141b]",
    ];
    const seed = all.reduce((sum, client) => sum + (client.sheet?.length || 0) + (client.name?.length || 0), 0) || 7;
    return [...palette].sort((a, b) => {
      const scoreA = ((a.length * 31) + seed) % 97;
      const scoreB = ((b.length * 31) + seed) % 97;
      return scoreA - scoreB;
    });
  }, [all]);

  const overview = useMemo(() => {
    const withData = all.filter((c) => c.measurements.length > 0);
    const avgFat = withData.reduce((s, c) => s + (getLatestMeasurement(c)?.fat_pct || 0), 0) / Math.max(withData.length, 1);

    const multiSession = all.filter((c) => c.measurements.length > 1);
    const avgWeightReduction =
      multiSession
        .map((c) => c.measurements.reduce((sum, m) => sum + (m.weight_loss_gain > 0 ? m.weight_loss_gain : 0), 0))
        .reduce((s, v) => s + v, 0) / Math.max(multiSession.length, 1);

    const mostConsistent = [...all].sort((a, b) => b.measurements.length - a.measurements.length)[0];
    const topResult = [...all].sort((a, b) => getTotalFatReduction(b.measurements) - getTotalFatReduction(a.measurements))[0];

    return { avgFat, avgWeightReduction, mostConsistent, topResult };
  }, [all]);

  const filtered = useMemo(() => {
    let rows = [...all].filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

    if (tab === "Male") rows = rows.filter((c) => normalizeGender(c.gender) === "male");
    if (tab === "Female") rows = rows.filter((c) => normalizeGender(c.gender) === "female");
    if (tab === "Most Progress") rows = rows.sort((a, b) => getTotalFatReduction(b.measurements) - getTotalFatReduction(a.measurements));
    if (tab === "Recent Activity") {
      rows = rows.sort((a, b) => {
        const da = getLatestMeasurement(a)?.date || "1970-01-01";
        const db = getLatestMeasurement(b)?.date || "1970-01-01";
        return new Date(db) - new Date(da);
      });
    }

    rows.sort((a, b) => {
      const av = getSortValue(a, sortBy);
      const bv = getSortValue(b, sortBy);
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

    return rows;
  }, [all, query, tab, sortBy, sortDir]);

  const top5 = useMemo(() => {
    return [...all]
      .map((member) => ({ member, reduction: getTotalFatReduction(member.measurements) }))
      .filter((item) => item.reduction > 0)
      .sort((a, b) => b.reduction - a.reduction)
      .slice(0, 5);
  }, [all]);

  const bmiData = useMemo(() => {
    const bins = { Underweight: 0, Normal: 0, Overweight: 0, Obese: 0 };

    all.forEach((client) => {
      const cls = getComputedHealth(client).bmiClass.label;
      if (cls.includes("Under")) bins.Underweight += 1;
      else if (cls.includes("Normal")) bins.Normal += 1;
      else if (cls.includes("Over")) bins.Overweight += 1;
      else bins.Obese += 1;
    });

    const colors = {
      Underweight: "#94a3b8",
      Normal: "#16a34a",
      Overweight: "#d97706",
      Obese: "#dc2626",
    };

    return Object.entries(bins).map(([name, value]) => ({ name, value, color: colors[name] }));
  }, [all]);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortDir("asc");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-slate-900">Member Overview</h1>
        <p className="text-slate-600">Operational summary for all enrolled members and Wellness Assessments.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Stat title="Total Enrolled Members" value={all.length} bgClass={statBackgrounds[0]} />
        <Stat title="Total Assessments Recorded" value={totalSessions} bgClass={statBackgrounds[1]} />
        <Stat title="Average Body Fat %" value={`${overview.avgFat.toFixed(1)}%`} bgClass={statBackgrounds[2]} />
        <Stat title="Average Weight Reduction" value={formatLbsWithKg(overview.avgWeightReduction)} bgClass={statBackgrounds[3]} />
        <Stat title="Most Consistent Member" value={overview.mostConsistent?.name || "-"} sub={`${overview.mostConsistent?.measurements.length || 0} assessments`} bgClass={statBackgrounds[4]} />
        <Stat
          title="Top Result"
          value={overview.topResult?.name || "-"}
          sub={`${formatLbsWithKg(getTotalFatReduction(overview.topResult?.measurements || []))} overall fat reduction`}
          bgClass={statBackgrounds[5]}
        />
      </div>

      <section className="card-surface p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Top 5 */}
          <div>
            <h3 className="font-display text-lg text-slate-900">Top 5 by Overall Fat Reduction</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
              {top5.length === 0 ? (
                <p className="text-sm text-slate-500">No member has recorded a positive overall fat reduction yet.</p>
              ) : top5.map(({ member, reduction }, idx) => {
                const latest = getLatestMeasurement(member);
                const tier = getWellnessTier(latest?.physique_rating || 0);
                return (
                  <div key={member.sheet} className="flex h-full flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                    <span className="font-data w-fit rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">#{idx + 1}</span>
                    <div>
                      <p className="text-slate-900">{member.name}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${tier.className}`}>{tier.label}</span>
                    </div>
                    <span className="font-data mt-auto text-green-600">{formatLbsWithKg(reduction)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: BMI Classification */}
          <div>
            <h3 className="font-display text-lg text-slate-900">BMI Classification Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={bmiData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                  {bmiData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} members`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {bmiData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-slate-600">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: <span className="font-data">{item.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:w-64"
            />
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-lg border px-2 py-1 text-xs ${
                    tab === t ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[1060px] text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-2 py-2 text-left">
                      <button type="button" onClick={() => toggleSort(column.key)} className="font-medium hover:text-slate-900">
                        {column.label}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, index) => {
                  const latest = getLatestMeasurement(member);
                  const tier = getWellnessTier(latest?.physique_rating || 0);
                  return (
                    <tr
                      key={member.sheet}
                      onClick={() => navigate(`/admin/member/${encodeURIComponent(member.sheet)}`)}
                      className={`cursor-pointer border-t border-slate-200 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}
                    >
                      <td className="px-2 py-2 text-slate-900">{member.name}</td>
                      <td className="px-2 py-2 text-slate-600">{normalizeGender(member.gender)}</td>
                      <td className="font-data px-2 py-2 text-slate-700">{member.age || "-"}</td>
                      <td className="px-2 py-2 text-slate-700">{formatHeightWithFeetInches(member.height)}</td>
                      <td className="font-data px-2 py-2 text-slate-700">{member.measurements.length}</td>
                      <td className="font-data px-2 py-2 text-slate-700">{latest ? formatWeightWithKg(latest.weight_lbs) : "-"}</td>
                      <td className="font-data px-2 py-2 text-slate-700">{latest ? latest.fat_pct : "-"}</td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${tier.className}`}>{tier.label}</span>
                      </td>
                      <td className="px-2 py-2 text-slate-700">{latest ? formatDate(latest.date) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
    </div>
  );
}

function Stat({ title, value, sub, bgClass = "bg-[#171c24]" }) {
  return (
    <div className={`card-surface p-4 ${bgClass}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="font-data mt-2 text-lg text-slate-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
