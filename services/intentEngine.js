// ╔══════════════════════════════════════════╗
// ║  NEXUS — Intent Engine                  ║
// ║  Classifies: COMMAND / QUERY / TASK /   ║
// ║  AUTOMATION / MEMORY / SYSTEM           ║
// ╚══════════════════════════════════════════╝

const INTENTS = {
  COMMAND:    ["do ", "execute", "run ", "open ", "launch", "start ", "stop ", "send ", "set "],
  TASK:       ["create", "build", "make", "write", "plan", "design", "generate", "banao", "likho", "bana"],
  AUTOMATION: ["every day", "daily", "routine", "schedule", "when i", "automatically", "workflow"],
  MEMORY:     ["remember", "save this", "my name is", "i am", "i like", "store this", "mera naam", "mujhe pasand"],
  SYSTEM:     ["clear memory", "reset", "status", "ping", "mode", "switch to", "version"],
};

const AGENTS = {
  coder:    ["code", "function", "debug", "script", "python", "javascript", "html", "css", "node", "react", "bug", "fix", "error", "compile", "class", "api", "database", "sql"],
  research: ["search", "find", "who is", "what is", "tell me about", "explain", "history", "define", "wikipedia", "ke baare mein", "kya hota hai", "kaun hai", "research"],
  planner:  ["plan", "schedule", "roadmap", "steps", "how do i", "guide", "strategy", "prioritize", "timeline"],
  executor: ["execute", "do this", "perform", "carry out", "action"],
};

const TOOLS = {
  weather:   ["weather", "temperature", "mausam", "garmi", "sardi", "rain", "barish", "forecast", "humidity"],
  news:      ["news", "headline", "khabar", "samachar", "breaking", "latest news", "aaj ki news"],
  calculate: ["calculate", "calc", "=", "solve", "math", "percent", "%", "sum", "kitna hoga"],
  searchWeb: ["search for", "google", "find me", "look up", "web search", "dhundo", "search karo"],
  imageGen:  ["generate image", "create image", "draw", "make image", "image of", "picture of", "tasveer", "image banao"],
};

function classifyIntent(msg) {
  const lower = msg.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return intent;
    }
  }
  return "QUERY";
}

function pickAgent(msg) {
  const lower = msg.toLowerCase();
  for (const [agent, keywords] of Object.entries(AGENTS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return agent;
    }
  }
  return "assistant";
}

function pickTool(msg) {
  const lower = msg.toLowerCase();
  for (const [tool, keywords] of Object.entries(TOOLS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        let args = null;
        if (tool === "weather") {
          const m = lower.match(/(?:in|at|for|of|mein)\s+([a-z\u0900-\u097f]+)/);
          args = m ? m[1] : "Delhi";
        }
        if (tool === "calculate") {
          args = msg.replace(/calculate|calc|solve|kitna hoga/gi, "").trim();
        }
        if (tool === "searchWeb") {
          args = msg.replace(/search for|google|find me|look up|web search|dhundo|search karo/gi, "").trim();
        }
        if (tool === "imageGen") {
          args = msg.replace(/generate image|create image|draw|make image|image of|picture of|tasveer|image banao/gi, "").trim();
        }
        return { tool, args };
      }
    }
  }
  return null;
}

function analyze(message) {
  const intent   = classifyIntent(message);
  const toolData = pickTool(message);
  const agent    = toolData ? "research" : pickAgent(message);

  return {
    intent,
    agent,
    tool:     toolData?.tool  || null,
    toolArgs: toolData?.args  || null,
  };
}

module.exports = { analyze };
