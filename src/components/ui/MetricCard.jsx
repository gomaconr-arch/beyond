import { TrendingDown, TrendingUp } from "lucide-react";

export default function MetricCard({ label, value, unit = "", delta, betterWhen = "higher" }) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const improved = betterWhen === "lower" ? delta < 0 : delta > 0;

  return (
    <div className="card-surface p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-data mt-2 text-2xl text-slate-900">
        {value}
        {unit}
      </p>
      {hasDelta ? (
        <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${improved ? "text-green-600" : "text-red-600"}`}>
          {improved ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(delta).toFixed(2)}
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-400">No prior Wellness Assessment</p>
      )}
    </div>
  );
}
