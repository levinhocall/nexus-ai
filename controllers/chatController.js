// ╔══════════════════════════════════════════╗
// ║  NEXUS — Chat Controller                ║
// ║  Full Pipeline:                         ║
// ║  Input → Intent → Memory → Tool →      ║
// ║  Agent → AI → Response → Memory Update ║
// ╚══════════════════════════════════════════╝

const memoryService = require("../services/memoryService");
const intentEngine  = require("../services/intentEngine");
const agentService  = require("../agents/agentService");
const toolService   = require("../services/toolService");
const aiService     = require("../services/aiService");

async function handleChat(req, res) {
  try {
    const { message, userId = "default", mode } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message required." });
    }

    console.log(`\n[NEXUS] User: ${userId} | Input: "${message}"`);

    // ── STEP 1: Analyze Intent ─────────────
    const analysis = intentEngine.analyze(message);
    const intent   = analysis.intent;
    const agentName = mode || analysis.agent; // allow manual mode override
    console.log(`[Intent] ${intent} → Agent: ${agentName} | Tool: ${analysis.tool || "none"}`);

    // ── STEP 2: Memory — Check for profile updates ──
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("my name is") || lowerMsg.includes("mera naam")) {
      const nameMatch = message.match(/(?:my name is|mera naam)\s+([a-zA-Z\u0900-\u097F]+)/i);
      if (nameMatch) memoryService.updateProfile(userId, { name: nameMatch[1] });
    }

    // ── STEP 3: Tool Execution ─────────────
    let toolContext = "";
    let toolUsed    = null;
    let imageUrl    = null;

    if (analysis.tool) {
      toolUsed = analysis.tool;

      if (toolUsed === "imageGen") {
        const result = toolService.imageGen(analysis.toolArgs || message);
        memoryService.saveMessage(userId, "user",      message);
        memoryService.saveMessage(userId, "assistant", `[Image: ${result.prompt}]`);
        return res.json({
          reply:    `Generated: "${result.prompt}"`,
          imageUrl: result.url,
          tool:     "imageGen",
          intent,
          agent:    agentName,
        });
      }

      try {
        let result;
        if      (toolUsed === "weather")    result = await toolService.weather(analysis.toolArgs);
        else if (toolUsed === "news")       result = await toolService.news();
        else if (toolUsed === "calculate")  result = toolService.calculate(analysis.toolArgs);

        toolContext = toolService.formatResult(toolUsed, result);
      } catch (toolErr) {
        console.error(`[NEXUS:Tool] ${toolUsed} failed:`, toolErr.message);
        toolContext = `Tool "${toolUsed}" failed. Responding from knowledge.`;
      }
    }

    // ── STEP 4: Load Memory ────────────────
    const history       = memoryService.getHistory(userId);
    const memoryContext = memoryService.buildMemoryContext(userId);

    // ── STEP 5: Get Agent System Prompt ───
    const systemPrompt = agentService.getSystemPrompt(agentName, memoryContext);

    // ── STEP 6: Call AI ────────────────────
    const reply = await aiService.chat(systemPrompt, history, message, toolContext);

    // ── STEP 7: Save to Memory ─────────────
    memoryService.saveMessage(userId, "user",      message);
    memoryService.saveMessage(userId, "assistant", reply);

    // ── STEP 8: Respond ────────────────────
    console.log(`[NEXUS] Response sent (${reply.length} chars)\n`);
    return res.json({
      reply,
      intent,
      agent:   agentName,
      tool:    toolUsed || null,
      imageUrl: imageUrl || null,
    });

  } catch (e) {
    console.error("[NEXUS:Controller] Critical error:", e.message);
    return res.status(500).json({ error: "NEXUS encountered an error. Retrying..." });
  }
}

function handleClearMemory(req, res) {
  const { userId = "default" } = req.body;
  memoryService.clearHistory(userId);
  return res.json({ success: true, message: "Memory cleared." });
}

function handleGetMemory(req, res) {
  const userId  = req.params.userId || "default";
  const history = memoryService.getHistory(userId);
  const profile = memoryService.getProfile(userId);
  return res.json({ userId, history, profile });
}

function handleStatus(req, res) {
  return res.json({
    system:  "NEXUS",
    version: "2.0",
    status:  "online",
    agents:  ["assistant", "coder", "research", "planner", "executor", "controller"],
    tools:   ["weather", "news", "calculate", "imageGen"],
  });
}

module.exports = { handleChat, handleClearMemory, handleGetMemory, handleStatus };
