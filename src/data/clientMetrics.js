import {
  classifyBMI,
  computeBMI,
  computeDBW,
  computeProteinIntake,
  heightToMeters,
} from "./formulas.js";

export const chartTheme = {
  background: "transparent",
  gridColor: "rgba(148, 163, 184, 0.22)",
  axisColor: "#cbd5e1",
  tooltipBg: "#151515",
  tooltipBorder: "#2a2a2a",
  tooltipTextColor: "#f8fafc",
  colors: {
    weight: "#4ade80",
    fat: "#f87171",
    muscle: "#22c55e",
    water: "#38bdf8",
    rmr: "#a3e635",
  },
};

export function normalizeGender(gender) {
  const val = String(gender || "").toLowerCase();
  if (val === "m" || val === "male") return "male";
  if (val === "f" || val === "female") return "female";
  return "unknown";
}

export function getLatestMeasurement(client) {
  return client?.measurements?.[client.measurements.length - 1] || null;
}

export function getBaselineMeasurement(client) {
  return client?.measurements?.[0] || null;
}

export function getWellnessTier(rating = 0) {
  if (rating <= 2) return { label: "Baseline", color: "#94a3b8", className: "bg-[#1f2937] text-slate-100 border border-[#334155]" };
  if (rating <= 4) return { label: "Developing", color: "#f59e0b", className: "bg-[#3f2a12] text-amber-200 border border-[#5c3b17]" };
  if (rating <= 6) return { label: "Proficient", color: "#38bdf8", className: "bg-[#102534] text-sky-200 border border-[#1e3a50]" };
  if (rating <= 8) return { label: "Advanced", color: "#4ade80", className: "bg-[#0f2b1a] text-green-200 border border-[#1b4b2d]" };
  return { label: "Peak Performer", color: "#a3e635", className: "bg-[#1e2f0f] text-lime-200 border border-[#36511c]" };
}

export function getProgramStage(measurements = []) {
  const n = measurements.length;
  if (n <= 1) return "Onboarding";
  if (n <= 4) return "Early Progress";
  if (n <= 9) return "Active Program";
  return "Established Member";
}

export function getVisceralFatGuidance(visceralRating) {
  const value = Number(visceralRating);
  if (!Number.isFinite(value)) {
    return {
      level: "unknown",
      title: "Unknown",
      className: "bg-[#1f2937] text-slate-100 border border-[#334155]",
      message: "Visceral fat rating is unavailable.",
    };
  }

  if (value <= 9) {
    return {
      level: "standard",
      title: "Standard",
      className: "bg-[#0f2b1a] text-green-200 border border-[#1b4b2d]",
      message: "Continue monitoring your rating within healthy range through appropriate exercise and balanced diet.",
    };
  }

  if (value < 15) {
    return {
      level: "high",
      title: "High",
      className: "bg-[#3f2a12] text-amber-200 border border-[#5c3b17]",
      message: "Consider changing diet and/or increasing exercise to reduce the fat to standard level.",
    };
  }

  return {
    level: "very-high",
    title: "Very High",
    className: "bg-[#3a1218] text-rose-200 border border-[#5b1d28]",
    message: "Should engage in more intensive exercise and make changes to current diet. Consult your physician for medical diagnosis.",
  };
}

export function getTotalFatReduction(measurements = []) {
  return measurements.reduce((sum, m) => sum + (m.fat_loss_gain > 0 ? m.fat_loss_gain : 0), 0);
}

export function getTotalWeightReduction(measurements = []) {
  return measurements.reduce((sum, m) => sum + (m.weight_loss_gain > 0 ? m.weight_loss_gain : 0), 0);
}

export function getMilestones(client) {
  const ms = client?.measurements || [];
  const latest = ms[ms.length - 1];
  const baseline = ms[0];

  return {
    fatReduction: getTotalFatReduction(ms) > 5,
    leanMassGained: latest && baseline && latest.muscle_mass - baseline.muscle_mass > 2,
    weightLossTarget: getTotalWeightReduction(ms) > 10,
    optimalHydration: latest && latest.water_pct >= 55,
    strongBoneDensity: latest && latest.bone_mass >= 7,
    fiveAssessments: ms.length >= 5,
    visceralReduced: latest && baseline && baseline.visceral_fat - latest.visceral_fat >= 2,
    metabolicOnTarget: latest && latest.metabolic_age <= (client?.age || 99),
  };
}

export const milestoneLabels = {
  fatReduction: "Fat Reduction >5 lbs",
  leanMassGained: "Lean Mass Gained",
  weightLossTarget: "Weight Loss >10 lbs",
  optimalHydration: "Optimal Hydration",
  strongBoneDensity: "Strong Bone Density",
  fiveAssessments: "5+ Assessments Completed",
  visceralReduced: "Visceral Fat Reduced",
  metabolicOnTarget: "Metabolic Age On Target",
};

export function getMemberSince(measurements = []) {
  return measurements.length ? measurements[0].date : null;
}

export function lbsToKg(lbs = 0) {
  return Number(lbs) * 0.45359237;
}

export function formatWeightWithKg(lbs) {
  if (lbs == null || Number.isNaN(Number(lbs))) return "-";
  const value = Number(lbs);
  return `${value.toFixed(1)} lbs (${lbsToKg(value).toFixed(1)} kg)`;
}

export function formatLbsWithKg(lbs) {
  return formatWeightWithKg(lbs);
}

export function formatHeightWithFeetInches(height) {
  if (!height) return "-";
  const raw = String(height).trim();

  const feetInches = raw.match(/^(\d+)\s*'\s*([\d.]+)\s*"?$/);
  if (feetInches) {
    const feet = Number(feetInches[1]);
    const inches = Number(feetInches[2]);
    const cm = ((feet * 12 + inches) * 2.54).toFixed(1);
    return `${feet}'${inches}" (${cm} cm)`;
  }

  const cmValue = raw.match(/^([\d.]+)\s*cm$/i);
  if (cmValue) {
    const cm = Number(cmValue[1]);
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = (totalInches - feet * 12).toFixed(1);
    return `${feet}'${inches}" (${cm.toFixed(1)} cm)`;
  }

  return raw;
}

export function formatDelta(value, precision = 2) {
  if (value == null || Number.isNaN(value)) return "-";
  const fixed = Number(value).toFixed(precision);
  return `${value > 0 ? "+" : ""}${fixed}`;
}

export function getComputedHealth(client) {
  const latest = getLatestMeasurement(client);
  const gender = normalizeGender(client?.gender);
  const heightM = heightToMeters(client?.height);
  const bmi = computeBMI(latest?.weight_kg || 0, heightM);
  const bmiClass = classifyBMI(bmi);
  const dbw = computeDBW(heightM, gender, bmiClass.label);
  const protein = computeProteinIntake(dbw);

  return {
    bmi,
    bmiClass,
    dbw,
    protein,
    heightM,
  };
}

export function formatDate(isoDate) {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function initials(name = "") {
  return name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function nameColor(name = "") {
  const palette = ["bg-sky-600", "bg-blue-700", "bg-cyan-700", "bg-indigo-600", "bg-slate-600"];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash += name.charCodeAt(i);
  return palette[Math.abs(hash) % palette.length];
}

// Backward compatibility helpers used by legacy components during transition.
export const getPhysiqueClass = (rating) => {
  const tier = getWellnessTier(rating);
  return { title: tier.label, color: tier.color, className: tier.className };
};

export const getLevel = (measurements = []) => getProgramStage(measurements);
export const getTotalFatLoss = (measurements = []) => getTotalFatReduction(measurements);
export const getTotalWeightLoss = (measurements = []) => getTotalWeightReduction(measurements);
export const getAchievements = (client) => getMilestones(client);
