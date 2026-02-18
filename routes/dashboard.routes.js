const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const { mostrarDashboard } = require("../controllers/dashboard.controller");

// ===============================
// DASHBOARD
// ===============================
router.get("/dashboard", requireLogin, mostrarDashboard);

module.exports = router;
