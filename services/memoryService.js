// ╔══════════════════════════════════════════╗
// ║  NEXUS — Memory System                  ║
// ║  Short-term: recent chat                ║
// ║  Long-term : user profile & facts       ║
// ╚══════════════════════════════════════════╝

const fs   = require("fs");
const path = require("path");

const MEMORY_DIR      = path.join(__dirname, "../memory");
const CHAT_FILE       = path.join(MEMORY_DIR, "chats.json");
const PROFILE_FILE    = path.join(MEMORY_DIR, "profiles.json");
const SHORT_TERM_LIMIT = 20; // keep last 20 messages in context

function ensureFiles() {
  if (!fs.existsSync(MEMORY_DIR))    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  if (!fs.existsSync(CHAT_FILE))     fs.writeFileSync(CHAT_FILE, "{}");
  if (!fs.existsSync(PROFILE_FILE))  fs.writeFileSync(PROFILE_FILE, "{}");
}

function readJSON(file) {
  try {
    ensureFiles();
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch { return {}; }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("[NEXUS:Memory] Write error:", e.message);
  }
}

// ── SHORT-TERM (chat history) ─────────────

function saveMessage(userId, role, content) {
  const chats = readJSON(CHAT_FILE);
  if (!chats[userId]) chats[userId] = [];
  chats[userId].push({ role, content, ts: Date.now() });
  writeJSON(CHAT_FILE, chats);
}

function getHistory(userId) {
  const chats = readJSON(CHAT_FILE);
  const all   = (chats[userId] || []);
  // Return only last SHORT_TERM_LIMIT messages for context
  return all.slice(-SHORT_TERM_LIMIT).map(({ role, content }) => ({ role, content }));
}

function clearHistory(userId) {
  const chats = readJSON(CHAT_FILE);
  chats[userId] = [];
  writeJSON(CHAT_FILE, chats);
}

// ── LONG-TERM (user profile) ──────────────

function updateProfile(userId, updates) {
  const profiles = readJSON(PROFILE_FILE);
  if (!profiles[userId]) profiles[userId] = {
    name: null,
    preferences: {},
    goals: [],
    habits: [],
    facts: [],
    createdAt: Date.now(),
  };
  Object.assign(profiles[userId], updates, { updatedAt: Date.now() });
  writeJSON(PROFILE_FILE, profiles);
}

function getProfile(userId) {
  const profiles = readJSON(PROFILE_FILE);
  return profiles[userId] || null;
}

function addFact(userId, fact) {
  const profiles = readJSON(PROFILE_FILE);
  if (!profiles[userId]) profiles[userId] = { facts: [] };
  if (!profiles[userId].facts) profiles[userId].facts = [];
  profiles[userId].facts.push({ fact, ts: Date.now() });
  writeJSON(PROFILE_FILE, profiles);
}

// Build a memory context string for the AI
function buildMemoryContext(userId) {
  const profile = getProfile(userId);
  if (!profile) return "";

  const lines = [];
  if (profile.name)               lines.push(`User name: ${profile.name}`);
  if (profile.goals?.length)      lines.push(`Goals: ${profile.goals.join(", ")}`);
  if (profile.habits?.length)     lines.push(`Habits: ${profile.habits.join(", ")}`);
  if (profile.facts?.length) {
    const recent = profile.facts.slice(-5).map(f => f.fact);
    lines.push(`Known facts: ${recent.join("; ")}`);
  }
  return lines.length ? `[MEMORY]\n${lines.join("\n")}` : "";
}

module.exports = {
  saveMessage,
  getHistory,
  clearHistory,
  updateProfile,
  getProfile,
  addFact,
  buildMemoryContext,
};
