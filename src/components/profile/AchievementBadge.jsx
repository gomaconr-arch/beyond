const achievementMeta = {
  fatBurner: { icon: "🔥", label: "Fat Burner" },
  muscleBuilder: { icon: "💪", label: "Muscle Builder" },
  weightWarrior: { icon: "📉", label: "Weight Warrior" },
  hydratedHero: { icon: "💧", label: "Hydrated Hero" },
  ironBones: { icon: "🦴", label: "Iron Bones" },
  consistent: { icon: "🎯", label: "Consistent" },
  visceralVanquisher: { icon: "🌊", label: "Visceral Vanquisher" },
  metabolicMaster: { icon: "⚡", label: "Metabolic Master" },
};

export function AchievementBadge({ code, unlocked }) {
  const meta = achievementMeta[code];
  if (!meta) return null;

  return (
    <div
      className={`rounded-xl border px-2 py-1 text-xs ${
        unlocked
          ? "border-amber-400/60 bg-amber-500/20 text-amber-100 shadow-[0_0_16px_rgba(245,200,66,0.35)] animate-pulse"
          : "border-slate-700 bg-slate-800/60 text-slate-500 grayscale opacity-40"
      }`}
      title={meta.label}
    >
      <span className="mr-1">{meta.icon}</span>
      {meta.label}
    </div>
  );
}
