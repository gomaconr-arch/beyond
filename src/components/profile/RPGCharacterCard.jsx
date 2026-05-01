import { useMemo } from "react";
import {
  formatHeightWithFeetInches,
  getComputedHealth,
  getLatestMeasurement,
  getMemberSince,
  getMilestones,
  getProgramStage,
  getWellnessTier,
  initials,
  milestoneLabels,
  nameColor,
  normalizeGender,
} from "../../data/clientMetrics";

export default function RPGCharacterCard({ client, headerControl = null, showUnearnedMilestones = true }) {
  const latest = getLatestMeasurement(client);

  const derived = useMemo(() => {
    const rating = latest?.physique_rating || 0;
    const tier = getWellnessTier(rating);
    const milestones = getMilestones(client);
    const programStage = getProgramStage(client.measurements || []);
    const health = getComputedHealth(client);
    return { tier, milestones, programStage, health };
  }, [client, latest]);

  const goalList = (client.goals || []).filter(Boolean);

  return (
    <aside className="card-surface p-5">
      <div className="space-y-4">
        {headerControl}

        <div className="flex items-center gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold text-white ${nameColor(client.name)}`}>
            {initials(client.name)}
          </div>
          <div>
            <h2 className="font-display text-xl text-slate-900">{client.name}</h2>
            <p className="text-sm text-slate-600">Member Profile</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${derived.tier.className}`}>
            {derived.tier.label}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
            {derived.programStage}
          </span>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Milestone Tags</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(milestoneLabels)
              .filter(([code]) => showUnearnedMilestones || derived.milestones[code])
              .map(([code, label]) => {
                const unlocked = Boolean(derived.milestones[code]);
                return (
                  <span
                    key={code}
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      unlocked
                        ? "border border-teal-200 bg-teal-50 text-teal-700"
                        : "border border-dashed border-slate-300 text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                );
              })}
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <p>
            Age {client.age || "-"} | {normalizeGender(client.gender)} | {formatHeightWithFeetInches(client.height)}
          </p>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Wellness Objectives</p>
            {goalList.length ? (
              <ul className="list-disc pl-5">
                {goalList.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No goals currently listed.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="text-slate-600">
            Assessments: <span className="font-data text-slate-900">{client.measurements?.length || 0}</span>
          </p>
          <p className="text-slate-600">
            Enrolled Since: <span className="font-data text-slate-900">{getMemberSince(client.measurements) || "-"}</span>
          </p>
          <p className="text-slate-600">
            BMI: <span className="font-data text-slate-900">{derived.health.bmi ? derived.health.bmi.toFixed(1) : "-"}</span>
            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-700 border border-slate-200">{derived.health.bmiClass.label}</span>
          </p>
          <p className="text-slate-600">
            Desirable Body Weight: <span className="font-data text-slate-900">{derived.health.dbw.toFixed(1)} kg</span>
          </p>
          <p className="text-slate-600">
            Daily Protein Intake: <span className="font-data text-slate-900">{derived.health.protein.min.toFixed(0)} - {derived.health.protein.max.toFixed(0)} g/day</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
