import { CLIENT_NAMES } from "./clients.js";

function toTokens(name) {
  return String(name)
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function createClientUser(name, usernameCounts) {
  const tokens = toTokens(name);
  const firstName = (tokens[0] || "client").toLowerCase();
  const lastName = (tokens[tokens.length - 1] || tokens[0] || "user").toLowerCase();
  const baseUsername = `${firstName}${lastName[0] || "x"}`;
  const nextCount = (usernameCounts[baseUsername] || 0) + 1;
  usernameCounts[baseUsername] = nextCount;
  const username = nextCount > 1 ? `${baseUsername}${nextCount}` : baseUsername;

  return {
    id: `client_${tokens.join("_").toLowerCase()}`,
    username,
    password: `${lastName}123`,
    role: "client",
    clientSheet: name,
    name,
  };
}

export const SEED_USERS = [
  {
    id: "admin_001",
    username: "admin",
    password: "wellness2024",
    role: "admin",
    name: "Coach Admin",
    email: "admin@wellness.app",
  },
  ...(() => {
    const usernameCounts = {};
    return CLIENT_NAMES.map((name) => createClientUser(name, usernameCounts));
  })(),
];
