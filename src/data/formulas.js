export function heightToMeters(heightStr) {
  if (!heightStr || typeof heightStr !== "string") return 0;

  const match = heightStr.trim().match(/(\d+)'\s*(\d+(?:\.\d+)?)?"?/);
  if (!match) return 0;

  const feet = Number(match[1] || 0);
  const inches = Number(match[2] || 0);
  const totalInches = feet * 12 + inches;
  return totalInches * 0.0254;
}

export function computeBMI(weightKg, heightM) {
  if (!weightKg || !heightM) return 0;
  return weightKg / (heightM * heightM);
}

export function classifyBMI(bmi) {
  if (!bmi) return { label: "Unknown", color: "slate" };
  if (bmi < 18.5) return { label: "Underweight", color: "blue" };
  if (bmi <= 22.9) return { label: "Normal", color: "green" };
  if (bmi <= 24.9) return { label: "Overweight", color: "yellow" };
  return { label: "Obese", color: "red" };
}

export function computeDBW(heightM, gender, bmiClass, frame = "medium") {
  if (!heightM) return 0;
  const normalized = String(gender || "").toLowerCase();
  const base = normalized === "male" || normalized === "m" ? heightM ** 2 * 22 : heightM ** 2 * 20.8;
  const adj = base * 0.1;

  if (bmiClass === "Normal") return base;
  if (bmiClass === "Overweight") return base - adj;
  if (bmiClass === "Obese") {
    if (frame === "small") return base - adj;
    if (frame === "large") return base + adj;
    return base;
  }

  return base;
}

export function computeProteinIntake(dbwKg) {
  return { min: dbwKg * 0.8, max: dbwKg * 1.2 };
}

export function computeOverallFatLbs(weightLbs, fatPct) {
  return weightLbs * (fatPct / 100);
}
