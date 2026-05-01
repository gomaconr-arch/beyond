import { classifyBMI, computeBMI, heightToMeters } from "./formulas";
import { normalizeGender } from "./clientMetrics";

const LBS_TO_KG = 0.45359237;
const KG_TO_LBS = 2.2046226218;
const MONTH_3_DAYS = 90;
const MONTH_6_DAYS = 180;
const MIN_PROJECTION_DAYS = 60;
const MAX_PROJECTION_DAYS = 180;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoDay(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysBetween(a, b) {
  const left = toIsoDay(a);
  const right = toIsoDay(b);
  if (!left || !right) return 0;
  return Math.max(0, Math.round((right.getTime() - left.getTime()) / 86400000));
}

function ema(values, alpha = 0.45) {
  if (!values.length) return 0;
  return values.slice(1).reduce((acc, item) => alpha * item + (1 - alpha) * acc, values[0]);
}

function bmiBucket(client, latestWeightLbs) {
  const heightM = heightToMeters(client.height);
  if (!heightM || !latestWeightLbs) return "unknown";
  const bmi = computeBMI(latestWeightLbs * LBS_TO_KG, heightM);
  return classifyBMI(bmi).label.toLowerCase();
}

function getDbwLbs(client) {
  const heightM = heightToMeters(client.height);
  if (!heightM) return 0;
  const gender = normalizeGender(client.gender);
  const dbwKg = gender === "male" ? heightM ** 2 * 22 : heightM ** 2 * 20.8;
  return dbwKg * KG_TO_LBS;
}

function withNormalizedTimeline(measurements) {
  if (!measurements.length) return [];
  const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstDate = sorted[0].date;

  return sorted.map((item) => ({
    ...item,
    days_in_program: daysBetween(firstDate, item.date),
  }));
}

function intervalStats(normalizedMeasurements) {
  if (normalizedMeasurements.length < 2) {
    return {
      weightLossPerDaySeries: [],
      fatDropPerDaySeries: [],
      musclePctPerMonthSeries: [],
    };
  }

  const weightLossPerDaySeries = [];
  const fatDropPerDaySeries = [];
  const musclePctPerMonthSeries = [];

  for (let i = 1; i < normalizedMeasurements.length; i += 1) {
    const prev = normalizedMeasurements[i - 1];
    const curr = normalizedMeasurements[i];
    const days = Math.max(1, toNumber(curr.days_in_program) - toNumber(prev.days_in_program));

    const prevWeight = toNumber(prev.weight_lbs);
    const currWeight = toNumber(curr.weight_lbs);
    const prevFat = toNumber(prev.fat_pct);
    const currFat = toNumber(curr.fat_pct);
    const prevMuscle = toNumber(prev.muscle_mass);
    const currMuscle = toNumber(curr.muscle_mass);

    weightLossPerDaySeries.push((prevWeight - currWeight) / days);
    fatDropPerDaySeries.push((prevFat - currFat) / days);

    if (prevMuscle > 0) {
      const monthlyPct = ((currMuscle - prevMuscle) / prevMuscle) * 100 * (30 / days);
      musclePctPerMonthSeries.push(monthlyPct);
    }
  }

  return {
    weightLossPerDaySeries,
    fatDropPerDaySeries,
    musclePctPerMonthSeries,
  };
}

function clampToPositive(value) {
  return Math.max(0, toNumber(value));
}

function round1(value) {
  return Number(toNumber(value).toFixed(1));
}

function normalizeProjectionDays(inputDays) {
  const raw = toNumber(inputDays, MAX_PROJECTION_DAYS);
  return Math.max(MIN_PROJECTION_DAYS, Math.min(MAX_PROJECTION_DAYS, raw));
}

function buildRatesBySimilarity(clients) {
  const valid = clients
    .map((client) => {
      const normalized = withNormalizedTimeline(client.measurements || []);
      const latest = normalized[normalized.length - 1] || null;
      const stats = intervalStats(normalized);

      return {
        client,
        normalized,
        latest,
        stats,
      };
    })
    .filter((item) => item.normalized.length >= 3);

  const groups = new Map();
  const allWeightRates = [];
  const allFatRates = [];
  const allMuscleRates = [];

  valid.forEach(({ client, latest, stats }) => {
    const key = `${normalizeGender(client.gender)}:${bmiBucket(client, latest?.weight_lbs)}`;
    const weightRate = clampToPositive(ema(stats.weightLossPerDaySeries));
    const fatRate = clampToPositive(ema(stats.fatDropPerDaySeries));
    const muscleMonthly = toNumber(ema(stats.musclePctPerMonthSeries));

    if (!groups.has(key)) groups.set(key, { weightRates: [], fatRates: [], muscleRates: [] });
    const g = groups.get(key);
    g.weightRates.push(weightRate);
    g.fatRates.push(fatRate);
    g.muscleRates.push(muscleMonthly);

    allWeightRates.push(weightRate);
    allFatRates.push(fatRate);
    allMuscleRates.push(muscleMonthly);
  });

  const averagedGroups = new Map();
  groups.forEach((value, key) => {
    averagedGroups.set(key, {
      weightLossPerDay: value.weightRates.length ? value.weightRates.reduce((s, v) => s + v, 0) / value.weightRates.length : 0,
      fatDropPerDay: value.fatRates.length ? value.fatRates.reduce((s, v) => s + v, 0) / value.fatRates.length : 0,
      musclePctPerMonth: value.muscleRates.length ? value.muscleRates.reduce((s, v) => s + v, 0) / value.muscleRates.length : 0,
    });
  });

  return {
    groups: averagedGroups,
    global: {
      weightLossPerDay: allWeightRates.length ? allWeightRates.reduce((s, v) => s + v, 0) / allWeightRates.length : 0.02,
      fatDropPerDay: allFatRates.length ? allFatRates.reduce((s, v) => s + v, 0) / allFatRates.length : 0.015,
      musclePctPerMonth: allMuscleRates.length ? allMuscleRates.reduce((s, v) => s + v, 0) / allMuscleRates.length : -0.5,
    },
  };
}

function blend(primary, secondary, primaryWeight) {
  return primary * primaryWeight + secondary * (1 - primaryWeight);
}

function buildClientProjection(client, cohortRates, options = {}) {
  const projectionDays = normalizeProjectionDays(options.maxDays);
  const normalizedMeasurements = withNormalizedTimeline(client.measurements || []);
  const latest = normalizedMeasurements[normalizedMeasurements.length - 1] || null;

  if (!latest) {
    return null;
  }

  const stats = intervalStats(normalizedMeasurements);
  const ownWeightLossPerDay = clampToPositive(ema(stats.weightLossPerDaySeries));
  const ownFatDropPerDay = clampToPositive(ema(stats.fatDropPerDaySeries));
  const ownMusclePctPerMonth = toNumber(ema(stats.musclePctPerMonthSeries));

  const similarityKey = `${normalizeGender(client.gender)}:${bmiBucket(client, latest.weight_lbs)}`;
  const similarityRates = cohortRates.groups.get(similarityKey) || cohortRates.global;

  let weightLossPerDay = 0;
  let fatDropPerDay = 0;
  let musclePctPerMonth = 0;
  let source;

  if (normalizedMeasurements.length === 1) {
    source = "cohort-standard";
    weightLossPerDay = similarityRates.weightLossPerDay;
    fatDropPerDay = similarityRates.fatDropPerDay;
    musclePctPerMonth = similarityRates.musclePctPerMonth;
  } else if (normalizedMeasurements.length < 3) {
    source = "limited-history-blend";
    weightLossPerDay = blend(ownWeightLossPerDay, similarityRates.weightLossPerDay, 0.4);
    fatDropPerDay = blend(ownFatDropPerDay, similarityRates.fatDropPerDay, 0.4);
    musclePctPerMonth = blend(ownMusclePctPerMonth, similarityRates.musclePctPerMonth, 0.4);
  } else {
    source = "history-similarity-blend";
    weightLossPerDay = blend(ownWeightLossPerDay, similarityRates.weightLossPerDay, 0.7);
    fatDropPerDay = blend(ownFatDropPerDay, similarityRates.fatDropPerDay, 0.7);
    musclePctPerMonth = blend(ownMusclePctPerMonth, similarityRates.musclePctPerMonth, 0.7);
  }

  const currentWeight = toNumber(latest.weight_lbs);
  const currentFatPct = toNumber(latest.fat_pct);
  const currentVisceral = toNumber(latest.visceral_fat);
  const currentMuscle = toNumber(latest.muscle_mass);
  const dbwLbs = getDbwLbs(client);

  const withinDbwBand = dbwLbs > 0 && Math.abs(currentWeight - dbwLbs) / dbwLbs <= 0.05;
  if (withinDbwBand) {
    weightLossPerDay *= 0.5;
  }

  const gender = normalizeGender(client.gender);
  const fatFloor = gender === "male" ? 8 : 18;

  const fullDays = [0, 30, 60, MONTH_3_DAYS, 120, 150, MONTH_6_DAYS];
  if (!fullDays.includes(projectionDays)) fullDays.push(projectionDays);
  fullDays.sort((a, b) => a - b);

  const fullTimeline = fullDays.map((day) => {
    const projectedWeight = Math.max(dbwLbs || 0, currentWeight - weightLossPerDay * day);
    const projectedFatPct = Math.max(fatFloor, currentFatPct - fatDropPerDay * day);
    const projectedTotalWeightLoss = Math.max(0, currentWeight - projectedWeight);

    const visceralDrops = Math.floor(projectedTotalWeightLoss / 5);
    const projectedVisceral = Math.max(1.0, currentVisceral - visceralDrops * 0.5);

    const monthlyFactor = day / 30;
    const projectedMuscle = Math.max(0, currentMuscle * (1 + (musclePctPerMonth / 100) * monthlyFactor));

    return {
      day,
      label: day === 0 ? "Now" : `Day ${day}`,
      weight_lbs: round1(projectedWeight),
      fat_pct: round1(projectedFatPct),
      visceral_fat: round1(projectedVisceral),
      muscle_mass: round1(projectedMuscle),
      overall_fat_lbs: round1(projectedWeight * (projectedFatPct / 100)),
    };
  });

  const timeline = fullTimeline.filter((item) => item.day <= projectionDays);
  const month3 = fullTimeline.find((item) => item.day === MONTH_3_DAYS) || null;
  const month6 = fullTimeline.find((item) => item.day === MONTH_6_DAYS) || null;
  const selected = timeline.find((item) => item.day === projectionDays) || timeline[timeline.length - 1] || null;
  const baselineOverallFatLbs = currentWeight * (currentFatPct / 100);

  const unsafeMuscleDrop = musclePctPerMonth < -2 && fatDropPerDay > 0;

  return {
    clientSheet: client.sheet,
    clientName: client.name,
    gender,
    measurementsCount: normalizedMeasurements.length,
    source,
    dbwLbs: round1(dbwLbs),
    current: {
      weight_lbs: round1(currentWeight),
      fat_pct: round1(currentFatPct),
      visceral_fat: round1(currentVisceral),
      muscle_mass: round1(currentMuscle),
      overall_fat_lbs: round1(baselineOverallFatLbs),
    },
    month3,
    month6,
    selected,
    projectionDays,
    timeline,
    normalizedMeasurements,
    rates: {
      weightLossPerDay: Number(weightLossPerDay.toFixed(4)),
      fatDropPerDay: Number(fatDropPerDay.toFixed(4)),
      musclePctPerMonth: Number(musclePctPerMonth.toFixed(3)),
    },
    safetyFlag: unsafeMuscleDrop,
    safetyReason: unsafeMuscleDrop
      ? "Fat% is projected to drop while muscle mass declines by more than 2% monthly."
      : null,
  };
}

export function buildProjectionReport(clients = [], options = {}) {
  const projectionDays = normalizeProjectionDays(options.maxDays);
  const cohortRates = buildRatesBySimilarity(clients);
  const clientReports = clients
    .map((client) => buildClientProjection(client, cohortRates, { maxDays: projectionDays }))
    .filter(Boolean)
    .sort((a, b) => a.clientName.localeCompare(b.clientName));

  const cohortSummary = clientReports.reduce(
    (acc, report) => {
      const projectedWeightLoss = Math.max(0, report.current.weight_lbs - report.month6.weight_lbs);
      const projectedFatLbsLoss = Math.max(0, report.current.overall_fat_lbs - report.month6.overall_fat_lbs);

      acc.totalExpectedWeightLossLbs += projectedWeightLoss;
      acc.totalExpectedFatLbsLoss += projectedFatLbsLoss;
      if (report.safetyFlag) acc.safetyFlagCount += 1;
      return acc;
    },
    {
      totalExpectedWeightLossLbs: 0,
      totalExpectedFatLbsLoss: 0,
      safetyFlagCount: 0,
      clientCount: clientReports.length,
    },
  );

  cohortSummary.totalExpectedWeightLossLbs = Number(cohortSummary.totalExpectedWeightLossLbs.toFixed(1));
  cohortSummary.totalExpectedFatLbsLoss = Number(cohortSummary.totalExpectedFatLbsLoss.toFixed(1));

  return {
    generatedAt: new Date().toISOString(),
    projectionDays,
    cohortSummary,
    clientReports,
  };
}
