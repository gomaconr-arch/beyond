export default function PrivacyToggle({ isPublic, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition ${
        isPublic
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-300 bg-slate-100 text-slate-600"
      }`}
    >
      <span>Profile Visibility: {isPublic ? "🌐 Visible to Community" : "🔒 Private"}</span>
      <span className={`h-5 w-10 rounded-full p-0.5 ${isPublic ? "bg-emerald-500/40" : "bg-slate-400"}`}>
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${isPublic ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}
