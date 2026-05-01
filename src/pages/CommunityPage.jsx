import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProgressRing from "../components/profile/ProgressRing";
import { useAppStore } from "../store/appStore";
import { usePrivacy } from "../hooks/usePrivacy";
import {
  formatHeightWithFeetInches,
  formatLbsWithKg,
  getMilestones,
  getProgramStage,
  getTotalFatReduction,
  getLatestMeasurement,
  getWellnessTier,
  initials,
  milestoneLabels,
  nameColor,
  normalizeGender,
} from "../data/clientMetrics";

export default function CommunityPage() {
  const clients = useAppStore((s) => s.clients);
  const { isPublic } = usePrivacy();
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState("all");

  const publicMembers = useMemo(() => clients.filter((member) => isPublic(member.sheet)), [clients, isPublic]);

  const privateCount = clients.length - publicMembers.length;

  const topPerformers = useMemo(
    () => [...publicMembers].sort((a, b) => getTotalFatReduction(b.measurements) - getTotalFatReduction(a.measurements)).slice(0, 10),
    [publicMembers],
  );

  const filtered = useMemo(() => {
    return publicMembers.filter((member) => {
      const latest = getLatestMeasurement(member);
      const tier = getWellnessTier(latest?.physique_rating || 0);
      const milestones = getMilestones(member);

      const passQuery = member.name.toLowerCase().includes(query.toLowerCase());
      const passGender = gender === "all" || normalizeGender(member.gender) === gender;
      const passTier = tierFilter === "all" || tier.label === tierFilter;
      const passMilestone = milestoneFilter === "all" || Boolean(milestones[milestoneFilter]);

      return passQuery && passGender && passTier && passMilestone;
    });
  }, [publicMembers, query, gender, tierFilter, milestoneFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-slate-900">Community</h1>
        <p className="text-slate-600">Top Performers and member directory for publicly visible profiles.</p>
      </div>

      <section className="card-surface p-4">
        <h2 className="font-display text-xl text-slate-900">Top Performers</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {topPerformers.map((member, idx) => {
            const latest = getLatestMeasurement(member);
            const tier = getWellnessTier(latest?.physique_rating || 0);
            return (
              <Link
                key={member.sheet}
                to={`/community/profile/${encodeURIComponent(member.sheet)}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center transition hover:border-slate-300 hover:bg-white"
              >
                <span className="font-data self-start rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">#{idx + 1}</span>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white ${nameColor(member.name)}`}>
                  {initials(member.name)}
                </div>
                <p className="text-sm font-medium leading-tight text-slate-900">{member.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs ${tier.className}`}>{tier.label}</span>
                {member.height ? (
                  <p className="text-xs text-slate-400">{formatHeightWithFeetInches(member.height)}</p>
                ) : null}
                <p className="font-data text-base font-semibold text-green-600">{formatLbsWithKg(getTotalFatReduction(member.measurements))}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card-surface p-4">
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by member name"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All Wellness Tiers</option>
            {[
              "Baseline",
              "Developing",
              "Proficient",
              "Advanced",
              "Peak Performer",
            ].map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
          <select value={milestoneFilter} onChange={(e) => setMilestoneFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All Milestones</option>
            {Object.entries(milestoneLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <p className="mb-4 text-sm text-slate-500">
          {privateCount > 0
            ? `${privateCount} members have set their profile to private.`
            : "All members are publicly visible."}
        </p>

        <div className="space-y-2 sm:grid sm:grid-cols-3 sm:gap-2 sm:space-y-0 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((member) => {
            const latest = getLatestMeasurement(member);
            const tier = getWellnessTier(latest?.physique_rating || 0);
            const stage = getProgramStage(member.measurements);
            const milestones = Object.entries(getMilestones(member)).filter(([, unlocked]) => unlocked).slice(0, 2);

            return (
              <Link
                key={member.sheet}
                to={`/community/profile/${encodeURIComponent(member.sheet)}`}
                className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 sm:hidden">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${nameColor(member.name)}`}>
                      {initials(member.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tier.className}`}>{tier.label}</span>
                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        <span className="font-data text-slate-700">{member.measurements.length}</span> assessments • {stage}
                      </p>
                    </div>
                  </div>
                  <ProgressRing value={latest?.physique_rating || 0} max={9} label="" color="#0f6cbd" size={46} textSize={22} textColor="#ffffff" />
                </div>

                <div className="hidden sm:block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${nameColor(member.name)}`}>
                        {initials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-900">{member.name}</p>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tier.className}`}>{tier.label}</span>
                      </div>
                    </div>
                    <ProgressRing value={latest?.physique_rating || 0} max={9} label="Score" color="#0f6cbd" size={56} textSize={28} textColor="#ffffff" />
                  </div>

                  <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                    <p><span className="font-data text-slate-700">{member.measurements.length}</span> assessments</p>
                    <p className="truncate text-slate-500">{stage}</p>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {milestones.length ? milestones.map(([key]) => (
                      <span key={key} className="rounded-full border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[10px] text-teal-700">
                        {milestoneLabels[key]}
                      </span>
                    )) : null}
                  </div>

                  <div className="mt-2 flex justify-end">
                    <p className="text-[11px] font-medium text-brand-primary">View →</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
