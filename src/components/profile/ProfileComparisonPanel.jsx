import { useMemo, useState } from "react";
import {
  formatLbsWithKg,
  formatHeightWithFeetInches,
  formatWeightWithKg,
  getLatestMeasurement,
  getTotalFatReduction,
  lbsToKg,
  normalizeGender,
} from "../../data/clientMetrics";

function CompareRow({ label, left, right, unit = "", formatValue, formatDiff }) {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  const canDiff = Number.isFinite(leftNumber) && Number.isFinite(rightNumber);
  const diff = canDiff ? rightNumber - leftNumber : null;
  const renderValue = formatValue || ((value) => `${value ?? "-"}${unit}`);
  const renderDiff = formatDiff || ((value) => `${value > 0 ? "+" : ""}${value.toFixed(2)}${unit}`);

  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 border-t border-slate-200 px-3 py-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-data text-slate-900">{renderValue(left)}</span>
      <span className="font-data text-slate-900">{renderValue(right)}</span>
      <span className={`font-data ${diff == null ? "text-slate-400" : diff === 0 ? "text-slate-500" : diff > 0 ? "text-green-600" : "text-red-600"}`}>
        {diff == null ? "-" : renderDiff(diff)}
      </span>
    </div>
  );
}

export default function ProfileComparisonPanel({ member, members }) {
  const [query, setQuery] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("");

  const candidates = useMemo(() => {
    return members
      .filter((m) => m.sheet !== member.sheet)
      .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  }, [members, member.sheet, query]);

  const selectedMember = useMemo(
    () => members.find((m) => m.sheet === selectedSheet) || null,
    [members, selectedSheet],
  );

  const baseLatest = getLatestMeasurement(member);
  const compareLatest = getLatestMeasurement(selectedMember);

  return (
    <section className="card-surface p-4">
      <h2 className="font-display text-lg text-slate-900">Compare Member Profile</h2>
      <p className="mb-3 text-sm text-slate-600">Search and select a member to compare the latest Body Composition metrics.</p>

      <div className="relative max-w-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search member to compare"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        {query && !selectedMember && candidates.length > 0 ? (
          <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            {candidates.map((candidate) => (
              <button
                key={candidate.sheet}
                type="button"
                onClick={() => {
                  setSelectedSheet(candidate.sheet);
                  setQuery(candidate.name);
                }}
                className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {candidate.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selectedMember ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 bg-slate-50 px-3 py-2 text-xs uppercase tracking-wide text-slate-500">
            <span>Metric</span>
            <span>{member.name}</span>
            <span>{selectedMember.name}</span>
            <span>Difference</span>
          </div>

          <CompareRow
            label="Body Weight"
            left={baseLatest?.weight_lbs}
            right={compareLatest?.weight_lbs}
            formatValue={(value) => formatWeightWithKg(value)}
            formatDiff={(value) => `${value > 0 ? "+" : ""}${value.toFixed(2)} lbs (${lbsToKg(value).toFixed(2)} kg)`}
          />
          <CompareRow label="Body Fat" left={baseLatest?.fat_pct} right={compareLatest?.fat_pct} unit=" %" />
          <CompareRow
            label="Lean Mass"
            left={baseLatest?.muscle_mass}
            right={compareLatest?.muscle_mass}
            formatValue={(value) => formatLbsWithKg(value)}
            formatDiff={(value) => `${value > 0 ? "+" : ""}${value.toFixed(2)} lbs (${lbsToKg(value).toFixed(2)} kg)`}
          />
          <CompareRow label="Visceral Fat Index" left={baseLatest?.visceral_fat} right={compareLatest?.visceral_fat} />
          <CompareRow label="Resting Metabolic Rate" left={baseLatest?.rmr} right={compareLatest?.rmr} unit=" kcal" />
          <CompareRow label="Metabolic Age" left={baseLatest?.metabolic_age} right={compareLatest?.metabolic_age} unit=" yrs" />
          <CompareRow label="Assessments" left={member.measurements.length} right={selectedMember?.measurements.length} />
          <CompareRow
            label="Overall Fat Reduction"
            left={getTotalFatReduction(member.measurements)}
            right={getTotalFatReduction(selectedMember?.measurements || [])}
            formatValue={(value) => formatLbsWithKg(value)}
            formatDiff={(value) => `${value > 0 ? "+" : ""}${value.toFixed(2)} lbs (${lbsToKg(value).toFixed(2)} kg)`}
          />

          <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Current profile: {normalizeGender(member.gender)} | {formatHeightWithFeetInches(member.height)} | {formatWeightWithKg(baseLatest?.weight_lbs)}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Select a member from search results to view comparison data.</p>
      )}
    </section>
  );
}
