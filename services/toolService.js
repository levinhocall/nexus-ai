// ╔══════════════════════════════════════════╗
// ║  NEXUS — Tool Service                   ║
// ╚══════════════════════════════════════════╝

const axios = require("axios");

// ── WEATHER ──────────────────────────────
async function weather(city = "Delhi") {
  try {
    const key = process.env.WEATHER_API_KEY;
    if (!key) return { error: "Weather API key not configured." };
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;
    const res = await axios.get(url, { timeout: 8000 });
    const d   = res.data;
    return {
      city:        d.name,
      country:     d.sys.country,
      temp:        d.main.temp,
      feels_like:  d.main.feels_like,
      humidity:    d.main.humidity,
      condition:   d.weather[0].description,
      wind:        d.wind.speed,
    };
  } catch (e) {
    return { error: `Weather fetch failed: ${e.message}` };
  }
}

// ── NEWS ─────────────────────────────────
async function news() {
  try {
    const key = process.env.NEWS_API_KEY;
    if (!key) return { error: "News API key not configured." };
    const url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=5&apiKey=${key}`;
    const res = await axios.get(url, { timeout: 8000 });
    return res.data.articles.map(a => ({
      title:  a.title,
      source: a.source.name,
      url:    a.url,
    }));
  } catch (e) {
    return { error: `News fetch failed: ${e.message}` };
  }
}

// ── CALCULATOR ───────────────────────────
function calculate(expr) {
  try {
    const sanitized = expr.replace(/[^0-9+\-*/().% ]/g, "");
    if (!sanitized) return { error: "Invalid expression" };
    const result = Function(`"use strict"; return (${sanitized})`)();
    return { expression: sanitized, result };
  } catch {
    return { error: "Could not evaluate expression." };
  }
}

// ── IMAGE GENERATION ─────────────────────
function imageGen(prompt) {
  const encoded = encodeURIComponent(prompt || "abstract art");
  return {
    url:    `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true`,
    prompt: prompt,
  };
}

// ── FORMAT TOOL RESULT ───────────────────
function formatResult(toolName, result) {
  if (!result || result.error) return `Tool "${toolName}" error: ${result?.error || "unknown"}`;

  switch (toolName) {
    case "weather": {
      const r = result;
      return `Weather in ${r.city}, ${r.country}:\nTemp: ${r.temp}°C (feels ${r.feels_like}°C)\nCondition: ${r.condition}\nHumidity: ${r.humidity}%\nWind: ${r.wind} m/s`;
    }
    case "news": {
      if (!Array.isArray(result)) return "No news data.";
      return "Top Headlines:\n" + result.map((n, i) => `${i + 1}. ${n.title} (${n.source})`).join("\n");
    }
    case "calculate": {
      return `Calculation: ${result.expression} = ${result.result}`;
    }
    default:
      return JSON.stringify(result);
  }
}

module.exports = { weather, news, calculate, imageGen, formatResult };
