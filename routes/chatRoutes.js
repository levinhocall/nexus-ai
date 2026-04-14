// ╔══════════════════════════════════════════╗
// ║  NEXUS — API Routes                     ║
// ╚══════════════════════════════════════════╝

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/chatController");

router.post("/chat",         ctrl.handleChat);
router.post("/memory/clear", ctrl.handleClearMemory);
router.get("/memory/:userId", ctrl.handleGetMemory);
router.get("/status",        ctrl.handleStatus);

module.exports = router;
