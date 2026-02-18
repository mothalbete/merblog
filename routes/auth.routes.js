const express = require("express");
const router = express.Router();

const {
  mostrarLanding,
  login,
  register,
  logout
} = require("../controllers/auth.controller");

// ===============================
// LANDING
// ===============================
router.get("/", mostrarLanding);

// ===============================
// LOGIN / REGISTER (redirecciones)
// ===============================
router.get("/login", (req, res) => res.redirect("/"));
router.get("/register", (req, res) => res.redirect("/"));

// ===============================
// LOGIN (POST)
// ===============================
router.post("/login", login);

// ===============================
// REGISTRO (POST)
// ===============================
router.post("/register", register);

// ===============================
// LOGOUT
// ===============================
router.get("/logout", logout);

module.exports = router;
