const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  crearPublicacion,
  eliminarPublicacion,
  obtenerPublicacion,
  obtenerPublicacionParaEditar,
  editarPublicacion
} = require("../controllers/publicaciones.controller");

// ===============================
// CREAR PUBLICACIÓN
// ===============================
router.post("/publicaciones/nueva", requireLogin, upload.single("imagen"), crearPublicacion);

// ===============================
// ELIMINAR PUBLICACIÓN
// ===============================
router.post("/publicaciones/:id/eliminar", requireLogin, eliminarPublicacion);

// ===============================
// OBTENER PUBLICACIÓN (LECTURA)
// ===============================
router.get("/publicaciones/:id", requireLogin, obtenerPublicacion);

// ===============================
// OBTENER DATOS PARA EDITAR
// ===============================
router.get("/publicaciones/:id/editar", requireLogin, obtenerPublicacionParaEditar);

// ===============================
// EDITAR PUBLICACIÓN
// ===============================
router.post("/publicaciones/:id/editar", requireLogin, upload.single("imagen"), editarPublicacion);

module.exports = router;
