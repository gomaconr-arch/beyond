export default function ProgressRing({ value = 0, max = 100, label, color = "#f5c842", size = 108, textSize = 20, textColor = "#f8fafc" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} stroke="#e2e8f0" strokeWidth="6" fill="none" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 56 56)"
        />
        <text x="56" y="62" textAnchor="middle" fill={textColor} fontSize={textSize} fontWeight="600" fontFamily="IBM Plex Mono">
          {value}
        </text>
      </svg>
      {label ? <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p> : null}
    </div>
  );
}
