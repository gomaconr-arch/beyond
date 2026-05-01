import { create } from "zustand";
import { CLIENTS } from "../data/clients.js";
import { SEED_USERS } from "../data/seedUsers.js";

const USERS_KEY = "wellness_users";
const AUTH_KEY = "wellness_auth";
const PRIVACY_KEY = "wellness_privacy";
const CLIENTS_KEY = "wellness_clients";

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function defaultPrivacy(clients = CLIENTS) {
  return clients.reduce((acc, client) => {
    acc[client.sheet] = true;
    return acc;
  }, {});
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function lbsToKg(lbs) {
  return toNumber(lbs) * 0.45359237;
}

function kgToLbs(kg) {
  return toNumber(kg) * 2.2046226218;
}

function calculateAgeFromBirthdate(birthdateInput) {
  const date = new Date(birthdateInput);
  if (Number.isNaN(date.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) age -= 1;
  return Math.max(age, 0);
}

function createClientSheet(name, clients = []) {
  const base = String(name || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!base) return `Client ${clients.length + 1}`;

  const hasExact = clients.some((c) => c.sheet === base);
  if (!hasExact) return base;

  let index = 2;
  while (clients.some((c) => c.sheet === `${base} (${index})`)) index += 1;
  return `${base} (${index})`;
}

function usernameFromName(name) {
  const clean = String(name || "")
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = (clean[0] || "client").toLowerCase();
  const last = (clean[clean.length - 1] || "user").toLowerCase();
  return `${first}${last[0] || "x"}`;
}

function createTemporaryCredentials(name, users) {
  const baseUsername = usernameFromName(name);
  let username = `${baseUsername}temp`;
  let index = 1;
  while (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    index += 1;
    username = `${baseUsername}temp${index}`;
  }

  const randomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const password = `BP-${randomCode}`;
  return { username, password };
}

function normalizeIsoDate(dateInput) {
  const raw = String(dateInput || "").trim();
  if (!raw) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00:00.000Z`;
  const asDate = new Date(raw);
  if (Number.isNaN(asDate.getTime())) return new Date().toISOString();
  return asDate.toISOString();
}

function measurementDateOnly(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function buildMeasurement(input, previousMeasurement = null) {
  const dateIso = normalizeIsoDate(input.date);

  const weightLbsRaw = input.weight_lbs;
  const weightKgRaw = input.weight_kg;
  const weight_lbs =
    weightLbsRaw !== "" && weightLbsRaw != null
      ? toNumber(weightLbsRaw)
      : kgToLbs(weightKgRaw);
  const weight_kg =
    weightKgRaw !== "" && weightKgRaw != null
      ? toNumber(weightKgRaw)
      : lbsToKg(weight_lbs);

  const fat_pct = toNumber(input.fat_pct);
  const overall_fat_lbs = weight_lbs * (fat_pct / 100);

  const measurement = {
    date: measurementDateOnly(dateIso),
    recorded_at: dateIso,
    weight_lbs: Number(weight_lbs.toFixed(1)),
    weight_kg: Number(weight_kg.toFixed(4)),
    fat_pct: Number(fat_pct.toFixed(1)),
    bone_mass: Number(toNumber(input.bone_mass).toFixed(1)),
    water_pct: Number(toNumber(input.water_pct).toFixed(1)),
    muscle_mass: Number(toNumber(input.muscle_mass).toFixed(1)),
    physique_rating: Number(toNumber(input.physique_rating).toFixed(1)),
    rmr: Number(toNumber(input.rmr).toFixed(1)),
    metabolic_age: Number(toNumber(input.metabolic_age).toFixed(1)),
    visceral_fat: Number(toNumber(input.visceral_fat).toFixed(1)),
    overall_fat_lbs: Number(overall_fat_lbs.toFixed(4)),
    overall_fat_kg: Number(lbsToKg(overall_fat_lbs).toFixed(4)),
  };

  if (previousMeasurement) {
    measurement.weight_loss_gain = Number((previousMeasurement.weight_lbs - measurement.weight_lbs).toFixed(1));
    measurement.fat_loss_gain = Number((previousMeasurement.overall_fat_lbs - measurement.overall_fat_lbs).toFixed(4));
  }

  return measurement;
}

function initializeStorage() {
  const users = safeParse(localStorage.getItem(USERS_KEY), null);
  const auth = safeParse(localStorage.getItem(AUTH_KEY), null);
  const privacy = safeParse(localStorage.getItem(PRIVACY_KEY), null);
  const clients = safeParse(localStorage.getItem(CLIENTS_KEY), null);

  if (!users) localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  if (!clients) localStorage.setItem(CLIENTS_KEY, JSON.stringify(CLIENTS));
  if (!privacy) localStorage.setItem(PRIVACY_KEY, JSON.stringify(defaultPrivacy()));
  if (!auth) localStorage.setItem(AUTH_KEY, JSON.stringify(null));
}

if (typeof window !== "undefined") initializeStorage();

export const useAppStore = create((set, get) => ({
  users: safeParse(localStorage.getItem(USERS_KEY), SEED_USERS),
  authUser: safeParse(localStorage.getItem(AUTH_KEY), null),
  clients: safeParse(localStorage.getItem(CLIENTS_KEY), CLIENTS),
  privacyMap: safeParse(localStorage.getItem(PRIVACY_KEY), defaultPrivacy(safeParse(localStorage.getItem(CLIENTS_KEY), CLIENTS))),

  login: (username, password) => {
    const user = get().users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password,
    );
    if (!user) return { ok: false, message: "Invalid credentials" };

    set({ authUser: user });
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return { ok: true, user };
  },

  logout: () => {
    set({ authUser: null });
    localStorage.setItem(AUTH_KEY, JSON.stringify(null));
  },

  setPrivacy: (clientSheet, isPublic) => {
    const next = { ...get().privacyMap, [clientSheet]: isPublic };
    set({ privacyMap: next });
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
  },

  addClientOnboarding: ({ basic, lifestyle, evaluation }) => {
    const state = get();
    const clients = state.clients || [];
    const users = state.users || [];

    const sheet = createClientSheet(basic?.name, clients);
    const firstMeasurement = buildMeasurement(evaluation);
    const { username, password } = createTemporaryCredentials(sheet, users);

    const newClient = {
      sheet,
      name: basic?.name?.trim() || sheet,
      gender: basic?.gender || "Unknown",
      birthdate: basic?.birthdate || null,
      age: calculateAgeFromBirthdate(basic?.birthdate),
      contact_number: basic?.contact_number?.trim() || "",
      email: basic?.email?.trim() || "",
      invited_by: basic?.invited_by?.trim() || "",
      top_health_goals: (basic?.top_health_goals || []).filter(Boolean),
      goals: (basic?.top_health_goals || []).filter(Boolean),
      medical_history: basic?.medical_history?.trim() || "",
      lifestyle_assessment: {
        completed_at: normalizeIsoDate(new Date().toISOString()),
        answers: lifestyle || {},
      },
      measurements: [firstMeasurement],
    };

    const newClientUser = {
      id: `client_${sheet.replace(/\s+/g, "_").toLowerCase()}`,
      username,
      password,
      role: "client",
      clientSheet: sheet,
      name: sheet,
      temporary: true,
      created_at: new Date().toISOString(),
    };

    const nextClients = [...clients, newClient];
    const nextUsers = [...users, newClientUser];
    const nextPrivacy = { ...state.privacyMap, [sheet]: true };

    set({ clients: nextClients, users: nextUsers, privacyMap: nextPrivacy });
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(nextClients));
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(nextPrivacy));

    return { ok: true, client: newClient, credentials: { username, password } };
  },

  addClientAssessment: ({ clientSheet, evaluation }) => {
    const state = get();
    const clients = state.clients || [];
    const idx = clients.findIndex((c) => c.sheet === clientSheet);
    if (idx < 0) return { ok: false, message: "Client not found." };

    const target = clients[idx];
    const previous = target.measurements?.[target.measurements.length - 1] || null;
    const nextMeasurement = buildMeasurement(evaluation, previous);

    const updatedClient = {
      ...target,
      measurements: [...(target.measurements || []), nextMeasurement],
    };

    const nextClients = [...clients];
    nextClients[idx] = updatedClient;

    set({ clients: nextClients });
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(nextClients));
    return { ok: true, client: updatedClient };
  },

  updateClientInfo: ({ clientSheet, updates }) => {
    const state = get();
    const clients = state.clients || [];
    const idx = clients.findIndex((c) => c.sheet === clientSheet);
    if (idx < 0) return { ok: false, message: "Client not found." };

    const current = clients[idx];
    const nextBirthdate = updates?.birthdate ?? current.birthdate ?? null;
    const merged = {
      ...current,
      ...updates,
      birthdate: nextBirthdate,
      age: calculateAgeFromBirthdate(nextBirthdate),
      top_health_goals: (updates?.top_health_goals || current.top_health_goals || current.goals || []).filter(Boolean),
    };

    if (merged.top_health_goals?.length) {
      merged.goals = merged.top_health_goals;
    }

    const nextClients = [...clients];
    nextClients[idx] = merged;

    set({ clients: nextClients });
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(nextClients));
    return { ok: true, client: merged };
  },

  removeClient: (clientSheet) => {
    const state = get();
    const clients = state.clients || [];
    const users = state.users || [];

    const existing = clients.find((c) => c.sheet === clientSheet);
    if (!existing) return { ok: false, message: "Client not found." };

    const nextClients = clients.filter((c) => c.sheet !== clientSheet);
    const nextUsers = users.filter((u) => u.clientSheet !== clientSheet);
    const nextPrivacy = { ...state.privacyMap };
    delete nextPrivacy[clientSheet];

    set({ clients: nextClients, users: nextUsers, privacyMap: nextPrivacy });
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(nextClients));
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(nextPrivacy));

    return { ok: true, removed: existing };
  },

  exportClientsJson: () => {
    const clients = get().clients || [];
    return JSON.stringify({ clients }, null, 2);
  },
}));

export { USERS_KEY, AUTH_KEY, PRIVACY_KEY, CLIENTS_KEY };
