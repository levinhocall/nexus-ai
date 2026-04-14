// ╔══════════════════════════════════════════════════════╗
// ║         NEXUS — Neural EXecution & Understanding System ║
// ║                    Entry Point                        ║
// ╚══════════════════════════════════════════════════════╝

require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const rateLimit = require("express-rate-limit");
const path      = require("path");

const chatRoutes = require("./routes/chatRoutes");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 80,
  message: { error: "Rate limit exceeded." },
});
app.use("/api", limiter);

app.use("/api", chatRoutes);

app.get("/ping", (req, res) => {
  res.json({ status: "online", system: "NEXUS", version: "2.0" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n⬡ NEXUS ONLINE — Port ${PORT}`);
  console.log(`  Health : http://localhost:${PORT}/ping`);
  console.log(`  API    : POST http://localhost:${PORT}/api/chat\n`);
});

module.exports = app;
