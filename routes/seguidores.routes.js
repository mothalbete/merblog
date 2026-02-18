const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const {
  seguirUsuario,
  dejarDeSeguirUsuario,
  obtenerSeguidores,
  obtenerSeguidos
} = require("../controllers/seguidores.controller");

// ===============================
// SEGUIR A UN USUARIO
// ===============================
router.post("/seguir/:id", requireLogin, seguirUsuario);

// ===============================
// DEJAR DE SEGUIR A UN USUARIO
// ===============================
router.post("/dejar-de-seguir/:id", requireLogin, dejarDeSeguirUsuario);

// ===============================
// LISTA DE SEGUIDORES
// ===============================
router.get("/seguidores/:id", requireLogin, obtenerSeguidores);

// ===============================
// LISTA DE SEGUIDOS
// ===============================
router.get("/seguidos/:id", requireLogin, obtenerSeguidos);

module.exports = router;
