import { formatDate, formatWeightWithKg, lbsToKg } from "../../data/clientMetrics";

function delta(curr, prev, key) {
  if (!prev || curr?.[key] == null || prev?.[key] == null) return null;
  return curr[key] - prev[key];
}

export default function SessionTimeline({ measurements = [] }) {
  const reversed = [...measurements].reverse();
  const fields = [
    "weight_lbs",
    "fat_pct",
    "muscle_mass",
    "water_pct",
    "bone_mass",
    "visceral_fat",
    "rmr",
    "metabolic_age",
  ];

  const fieldLabels = {
    weight_lbs: "weight (lbs / kg)",
    fat_pct: "fat pct",
    muscle_mass: "muscle mass",
    water_pct: "water pct",
    bone_mass: "bone mass",
    visceral_fat: "visceral fat",
    rmr: "rmr",
    metabolic_age: "metabolic age",
  };

  return (
    <div className="space-y-4">
      {reversed.map((session, idx) => {
        const originalIndex = measurements.length - 1 - idx;
        const prev = measurements[originalIndex - 1];

        return (
          <details key={session.date + idx} className="card-surface group p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:w-56 sm:shrink-0">
                  <span className="text-xs uppercase tracking-wide text-slate-500">Assessment Date</span>
                  <h4 className="font-display text-base text-slate-900">{formatDate(session.date)}</h4>
                </div>
                <span className="text-xs text-slate-500">Select to view full record</span>
              </div>
            </summary>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              {fields.map((key) => {
                const d = delta(session, prev, key);
                const isWeight = key === "weight_lbs";
                return (
                  <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{fieldLabels[key] || key.replace(/_/g, " ")}</p>
                    <p className="font-data text-slate-900">{isWeight ? formatWeightWithKg(session[key]) : session[key]}</p>
                    <p className={d == null ? "text-slate-400" : d <= 0 ? "text-green-600" : "text-red-600"}>
                      {d == null ? "-" : isWeight ? `${d > 0 ? "+" : ""}${d.toFixed(2)} lbs (${lbsToKg(d).toFixed(2)} kg)` : `${d > 0 ? "+" : ""}${d.toFixed(2)}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
