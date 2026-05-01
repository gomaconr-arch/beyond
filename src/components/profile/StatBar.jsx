export default function StatBar({ label, value = 0, max = 100, color = "bg-emerald-500", suffix = "%" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span className="font-medium">{label}</span>
        <span className="font-data">
          {value}
          {suffix}
        </span>
      </div>
      <div className="metric-track">
        <div
          className={`metric-fill rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
