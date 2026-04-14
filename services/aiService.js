// ╔══════════════════════════════════════════╗
// ║  NEXUS — AI Service (Groq / LLaMA 3.3)  ║
// ╚══════════════════════════════════════════╝

const axios = require("axios");
require("dotenv").config();

const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function chat(systemPrompt, history = [], userMessage, toolContext = "") {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
    ];

    const finalMsg = toolContext
      ? `[TOOL DATA]\n${toolContext}\n\n[USER]\n${userMessage}`
      : userMessage;

    messages.push({ role: "user", content: finalMsg });

    const res = await axios.post(
      GROQ_URL,
      {
        model:       GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens:  1200,
      },
      {
        headers: {
          Authorization:  `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const reply = res.data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Empty response from AI");
    return reply.trim();

  } catch (e) {
    console.error("[NEXUS:AI] Error:", e.response?.data || e.message);
    if (e.response?.status === 401) return "API key invalid. Check configuration.";
    if (e.response?.status === 429) return "Rate limit hit. Retry in a moment.";
    return "Connection failure. Retrying shortly.";
  }
}

module.exports = { chat };
