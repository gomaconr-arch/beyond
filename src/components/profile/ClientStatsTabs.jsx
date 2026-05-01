import { useMemo, useState } from "react";
import { Activity, BarChart2, CalendarDays, LayoutDashboard, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
} from "recharts";
import MetricCard from "../ui/MetricCard";
import SessionTimeline from "../ui/SessionTimeline";
import StatBar from "./StatBar";
import ProgressRing from "./ProgressRing";
import { useAppStore } from "../../store/appStore";
import { buildProjectionReport } from "../../data/projections";
import { chartTheme, formatDate, formatLbsWithKg, formatWeightWithKg, getComputedHealth, getVisceralFatGuidance } from "../../data/clientMetrics";

const tabs = [
  { key: "current", label: "Current Metrics", icon: Activity },
  { key: "progress", label: "Progress Reports", icon: BarChart2 },
  { key: "history", label: "Assessment History", icon: LayoutDashboard },
  { key: "health", label: "Health Computations", icon: Users },
  { key: "projection", label: "180-Day Projection", icon: TrendingUp },
];

function EmptyState({ message }) {
  return (
    <div className="card-surface flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
      <BarChart2 size={48} className="text-slate-300" />
      <p className="max-w-2xl text-sm text-slate-600">{message}</p>
    </div>
  );
}

function metricDelta(current, prev, key) {
  if (!current || !prev || current[key] == null || prev[key] == null) return null;
  return current[key] - prev[key];
}

export default function ClientStatsTabs({ client }) {
  const allClients = useAppStore((s) => s.clients);
  const [tab, setTab] = useState(tabs[0].key);
  const [projectionDays, setProjectionDays] = useState(180);
  const measurements = useMemo(() => client.measurements ?? [], [client.measurements]);

  const derived = useMemo(() => {
    const latest = measurements[measurements.length - 1] || null;
    const prev = measurements[measurements.length - 2] || null;
    const health = getComputedHealth(client);

    const chartData = measurements.map((m) => ({
      date: formatDate(m.date),
      weight: m.weight_lbs,
      fat: m.fat_pct,
      visceral: m.visceral_fat,
      muscle: m.muscle_mass,
      fatChange: m.fat_loss_gain ? Number(m.fat_loss_gain) : 0,
      fatReduction: (m.fat_loss_gain || 0) > 0 ? m.fat_loss_gain : 0,
      fatIncrease: (m.fat_loss_gain || 0) < 0 ? Math.abs(m.fat_loss_gain) : 0,
      rmr: m.rmr,
      metabolicAge: m.metabolic_age,
      chronologicalAge: client.age,
    }));

    return { latest, prev, health, chartData };
  }, [client, measurements]);

  const projection = useMemo(() => {
    const report = buildProjectionReport(allClients, { maxDays: projectionDays });
    return report.clientReports.find((item) => item.clientSheet === client.sheet) || null;
  }, [allClients, client.sheet, projectionDays]);

  const currentVisceralGuide = useMemo(() => getVisceralFatGuidance(derived.latest?.visceral_fat), [derived.latest?.visceral_fat]);
  const projectedVisceralGuide = useMemo(() => getVisceralFatGuidance(projection?.selected?.visceral_fat), [projection?.selected?.visceral_fat]);

  let projectionTargetDate = "-";
  if (derived.latest?.date) {
    const base = new Date(derived.latest.date);
    if (!Number.isNaN(base.getTime())) {
      base.setDate(base.getDate() + projectionDays);
      projectionTargetDate = formatDate(base.toISOString());
    }
  }

  if (!measurements.length) {
    return (
      <EmptyState message="No assessment data on file. This member's baseline will appear here after their first Wellness Assessment is completed." />
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            title={item.label}
            aria-label={item.label}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              item.key === tab
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="sm:hidden"><Icon size={16} /></span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
          );
        })}
      </div>

      {tab === "current" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Body Weight"
              value={formatWeightWithKg(derived.latest.weight_lbs)}
              delta={metricDelta(derived.latest, derived.prev, "weight_lbs")}
              betterWhen="lower"
            />
            <MetricCard
              label="Body Fat %"
              value={derived.latest.fat_pct}
              unit="%"
              delta={metricDelta(derived.latest, derived.prev, "fat_pct")}
              betterWhen="lower"
            />
            <MetricCard
              label="Lean Mass"
              value={derived.latest.muscle_mass}
              unit=" lbs"
              delta={metricDelta(derived.latest, derived.prev, "muscle_mass")}
              betterWhen="higher"
            />
            <MetricCard
              label="Visceral Fat Index"
              value={derived.latest.visceral_fat}
              delta={metricDelta(derived.latest, derived.prev, "visceral_fat")}
              betterWhen="lower"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="card-surface space-y-4 p-4">
              <StatBar label="Body Fat %" value={derived.latest.fat_pct} max={45} color="bg-red-500" />
              <StatBar label="Body Water %" value={derived.latest.water_pct} max={70} color="bg-sky-500" />
              <StatBar
                label="Muscle Mass (%)"
                value={Number(((derived.latest.muscle_mass / derived.latest.weight_lbs) * 100).toFixed(1))}
                max={100}
                color="bg-green-600"
              />
              <StatBar label="Bone Mass" value={derived.latest.bone_mass} max={12} color="bg-amber-600" suffix=" lbs" />
            </div>

            <div className="card-surface flex items-center justify-center gap-8 p-4">
              <ProgressRing value={derived.latest.physique_rating} max={9} label="Physique Score" color="#0f6cbd" />
              <ProgressRing value={derived.latest.visceral_fat} max={20} label="Visceral Fat Index" color="#64748b" />
            </div>
          </div>
        </div>
      )}

      {tab === "progress" && (
        <div className="space-y-4">
          {measurements.length < 2 ? (
            <EmptyState message="Additional assessments are required to generate trend reports. Trend data will be available after the next scheduled Wellness Assessment." />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="card-surface h-72 p-3">
                <h4 className="font-display mb-2 text-sm text-slate-700">Body Weight over time</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={derived.chartData}>
                    <CartesianGrid stroke={chartTheme.gridColor} />
                    <XAxis dataKey="date" stroke={chartTheme.axisColor} />
                    <YAxis stroke={chartTheme.axisColor} />
                    <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
                    <Line dataKey="weight" stroke={chartTheme.colors.weight} strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card-surface h-72 p-3">
                <h4 className="font-display mb-2 text-sm text-slate-700">Body Fat % vs Muscle Mass trend</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={derived.chartData}>
                    <CartesianGrid stroke={chartTheme.gridColor} />
                    <XAxis dataKey="date" stroke={chartTheme.axisColor} />
                    <YAxis yAxisId="left" stroke={chartTheme.axisColor} />
                    <YAxis yAxisId="right" orientation="right" stroke={chartTheme.axisColor} />
                    <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
                    <Area yAxisId="left" dataKey="fat" stroke={chartTheme.colors.fat} fill="rgba(220,38,38,0.3)" />
                    <Line yAxisId="right" dataKey="muscle" stroke={chartTheme.colors.muscle} strokeWidth={2.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="card-surface h-72 p-3">
                <h4 className="font-display mb-2 text-sm text-slate-700">Fat Reduction per Assessment</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derived.chartData}>
                    <CartesianGrid stroke={chartTheme.gridColor} />
                    <XAxis dataKey="date" stroke={chartTheme.axisColor} />
                    <YAxis stroke={chartTheme.axisColor}>
                      <Label value="Change (lbs)" angle={-90} position="insideLeft" />
                    </YAxis>
                    <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <Bar dataKey="fatReduction" fill="#16a34a" />
                    <Bar dataKey="fatIncrease" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card-surface h-72 p-3">
                <h4 className="font-display mb-2 text-sm text-slate-700">Resting Metabolic Rate (kcal/day)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={derived.chartData}>
                    <CartesianGrid stroke={chartTheme.gridColor} />
                    <XAxis dataKey="date" stroke={chartTheme.axisColor} />
                    <YAxis stroke={chartTheme.axisColor} />
                    <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
                    <Line dataKey="rmr" stroke={chartTheme.colors.rmr} strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card-surface h-72 p-3 xl:col-span-2">
                <h4 className="font-display mb-2 text-sm text-slate-700">Metabolic Age vs Chronological Age</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={derived.chartData}>
                    <CartesianGrid stroke={chartTheme.gridColor} />
                    <XAxis dataKey="date" stroke={chartTheme.axisColor} />
                    <YAxis stroke={chartTheme.axisColor} />
                    <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
                    <Line dataKey="metabolicAge" stroke={chartTheme.colors.weight} strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line dataKey="chronologicalAge" stroke="#64748b" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                    <ReferenceLine y={client.age} stroke="#64748b" strokeDasharray="6 4" label="Chronological Age" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card-surface h-72 p-3 xl:col-span-2">
                <h4 className="font-display mb-2 text-sm text-slate-700">Visceral Fat Progress and Category Guidance</h4>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={derived.chartData}>
                    <CartesianGrid stroke={chartTheme.gridColor} />
                    <XAxis dataKey="date" stroke={chartTheme.axisColor} />
                    <YAxis stroke={chartTheme.axisColor} domain={[0, 20]} />
                    <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
                    <ReferenceLine y={9} stroke="#4ade80" strokeDasharray="4 4" />
                    <ReferenceLine y={14} stroke="#f59e0b" strokeDasharray="4 4" />
                    <Line dataKey="visceral" stroke={chartTheme.colors.water} strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-1 rounded-lg border border-slate-700 bg-[#12181f] px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">Current Category</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${currentVisceralGuide.className}`}>{currentVisceralGuide.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{currentVisceralGuide.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "history" && <SessionTimeline measurements={measurements} />}

      {tab === "health" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="card-surface p-4">
            <p className="text-slate-600">BMI</p>
            <p className="font-data text-2xl text-slate-900">{derived.health.bmi.toFixed(2)}</p>
            <p className="mt-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 inline-block">{derived.health.bmiClass.label}</p>
            <p className="mt-2 text-xs text-slate-500">Formula</p>
            <p className="font-data text-xs text-slate-500">weight_kg / (height_m^2)</p>
          </div>

          <div className="card-surface p-4">
            <p className="text-slate-600">Desirable Body Weight</p>
            <p className="font-data text-2xl text-slate-900">{derived.health.dbw.toFixed(2)} kg</p>
            <p className="mt-2 text-xs text-slate-500">Formula</p>
            <p className="font-data text-xs text-slate-500">height_m^2 x 22 (male) or height_m^2 x 20.8 (female)</p>
          </div>

          <div className="card-surface p-4 md:col-span-2">
            <p className="text-slate-600">Daily Protein Intake Range</p>
            <p className="font-data text-2xl text-slate-900">
              {derived.health.protein.min.toFixed(1)} g - {derived.health.protein.max.toFixed(1)} g / day
            </p>
            <p className="mt-2 text-xs text-slate-500">Formula</p>
            <p className="font-data text-xs text-slate-500">DBW (kg) x 0.8 to DBW (kg) x 1.2 g/day</p>
          </div>

          <div className="card-surface p-4 md:col-span-2">
            <p className="text-slate-600">Visceral Fat Report Emphasis</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-data text-2xl text-slate-900">{derived.latest?.visceral_fat ?? "-"}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${currentVisceralGuide.className}`}>{currentVisceralGuide.title}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{currentVisceralGuide.message}</p>
          </div>
        </div>
      )}

      {tab === "projection" && (
        <div className="space-y-4">
          {projection ? (
            <>
              <div className="card-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Projection Window</p>
                    <p className="font-data text-lg text-slate-900">{projectionDays} days</p>
                    <p className="text-xs text-slate-500">Target date: {projectionTargetDate}</p>
                  </div>
                  <CalendarDays size={20} className="text-brand-primary" />
                </div>

                <div className="mt-3 rounded-lg border border-slate-700 bg-[#12181f] px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Visceral Fat Projection Emphasis</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-data text-slate-100">Current: {projection.current.visceral_fat.toFixed(1)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${currentVisceralGuide.className}`}>{currentVisceralGuide.title}</span>
                    <span className="text-slate-500">→</span>
                    <span className="font-data text-slate-100">Day {projection.projectionDays}: {projection.selected.visceral_fat.toFixed(1)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${projectedVisceralGuide.className}`}>{projectedVisceralGuide.title}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{projectedVisceralGuide.message}</p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_150px]">
                  <input
                    type="range"
                    min={60}
                    max={180}
                    step={30}
                    value={projectionDays}
                    onChange={(e) => setProjectionDays(Number(e.target.value))}
                    className="w-full"
                  />
                  <select
                    value={projectionDays}
                    onChange={(e) => setProjectionDays(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {[60, 90, 120, 150, 180].map((day) => (
                      <option key={day} value={day}>{day} days</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card-surface h-72 p-3">
                <h4 className="font-display mb-2 text-sm text-slate-700">Projected Priority Metrics</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projection.timeline}>
                    <CartesianGrid stroke={chartTheme.gridColor} />
                    <XAxis dataKey="day" stroke={chartTheme.axisColor} />
                    <YAxis yAxisId="left" stroke={chartTheme.axisColor} />
                    <YAxis yAxisId="right" orientation="right" stroke={chartTheme.axisColor} />
                    <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}` }} />
                    <Legend />
                    <Line yAxisId="left" dataKey="weight_lbs" stroke={chartTheme.colors.weight} strokeWidth={2.5} name="Weight (lbs)" dot={{ r: 3 }} />
                    <Line yAxisId="right" dataKey="fat_pct" stroke={chartTheme.colors.fat} strokeWidth={2.3} name="Fat %" dot={{ r: 3 }} />
                    <Line yAxisId="right" dataKey="visceral_fat" stroke={chartTheme.colors.water} strokeWidth={2.3} name="Visceral Fat" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card-surface p-4">
                <h4 className="font-display text-sm text-slate-700">Checkpoint Values</h4>
                <div className="mt-2 overflow-auto">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-2 py-2 text-left">Metric</th>
                        <th className="px-2 py-2 text-left">Current</th>
                        <th className="px-2 py-2 text-left">Day 90 (Month 3)</th>
                        <th className="px-2 py-2 text-left">Day {projection.projectionDays}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-200">
                        <td className="px-2 py-2 text-slate-600">Weight</td>
                        <td className="font-data px-2 py-2 text-slate-900">{formatWeightWithKg(projection.current.weight_lbs)}</td>
                        <td className="font-data px-2 py-2 text-slate-900">{projection.month3 ? formatWeightWithKg(projection.month3.weight_lbs) : "-"}</td>
                        <td className="font-data px-2 py-2 text-slate-900">{formatWeightWithKg(projection.selected.weight_lbs)}</td>
                      </tr>
                      <tr className="border-t border-slate-200">
                        <td className="px-2 py-2 text-slate-600">Fat %</td>
                        <td className="font-data px-2 py-2 text-slate-900">{projection.current.fat_pct.toFixed(1)}%</td>
                        <td className="font-data px-2 py-2 text-slate-900">{projection.month3 ? `${projection.month3.fat_pct.toFixed(1)}%` : "-"}</td>
                        <td className="font-data px-2 py-2 text-slate-900">{projection.selected.fat_pct.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-t border-slate-200">
                        <td className="px-2 py-2 text-slate-600">Visceral Fat</td>
                        <td className="font-data px-2 py-2 text-slate-900">{projection.current.visceral_fat.toFixed(1)}</td>
                        <td className="font-data px-2 py-2 text-slate-900">{projection.month3 ? projection.month3.visceral_fat.toFixed(1) : "-"}</td>
                        <td className="font-data px-2 py-2 text-slate-900">{projection.selected.visceral_fat.toFixed(1)}</td>
                      </tr>
                      <tr className="border-t border-slate-200">
                        <td className="px-2 py-2 text-slate-600">Overall Fat</td>
                        <td className="font-data px-2 py-2 text-slate-900">{formatLbsWithKg(projection.current.overall_fat_lbs)}</td>
                        <td className="font-data px-2 py-2 text-slate-900">{projection.month3 ? formatLbsWithKg(projection.month3.overall_fat_lbs) : "-"}</td>
                        <td className="font-data px-2 py-2 text-slate-900">{formatLbsWithKg(projection.selected.overall_fat_lbs)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <EmptyState message="Projection data is unavailable for this member due to missing baseline measurements." />
          )}
        </div>
      )}
    </section>
  );
}
