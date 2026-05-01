import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export default function StatRadarChart({ latest }) {
  if (!latest) return null;

  const data = [
    { stat: "Fat", value: latest.fat_pct },
    { stat: "Water", value: latest.water_pct },
    { stat: "Muscle", value: (latest.muscle_mass / latest.weight_lbs) * 100 },
    { stat: "Bone", value: latest.bone_mass * 10 },
    { stat: "Physique", value: (latest.physique_rating / 9) * 100 },
  ];

  return (
    <div className="h-64 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-3">
      <h4 className="mb-2 text-sm text-slate-300">Normalized Stat Radar</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(107,122,158,0.3)" />
          <PolarAngleAxis dataKey="stat" stroke="#94a3b8" />
          <PolarRadiusAxis stroke="#64748b" domain={[0, 100]} />
          <Radar dataKey="value" stroke="#f5c842" fill="#f5c842" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
