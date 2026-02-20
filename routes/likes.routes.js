const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const { darLike, quitarLike } = require("../controllers/likes.controller");

// DAR LIKE
router.post("/like/:id_publicacion", requireLogin, darLike);

// QUITAR LIKE
router.post("/unlike/:id_publicacion", requireLogin, quitarLike);

module.exports = router;
