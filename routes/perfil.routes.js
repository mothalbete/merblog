const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const { editarPerfil, obtenerPerfilPublicoData } = require("../controllers/perfil.controller");

// ⭐ NECESARIO PARA /usuario-publico/:id
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ===============================
// EDITAR PERFIL
// ===============================
router.post("/perfil/editar", requireLogin, editarPerfil);

// ===============================
// PERFIL PÚBLICO (JSON ANTIGUO)
// ===============================
router.get("/usuario-publico/:id", requireLogin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const yo = req.session.user.id;

        const user = await prisma.usuarios.findUnique({
            where: { id_usuario: id },
            select: {
                id_usuario: true,
                nombre: true,
                biografia: true,

                seguidores: {
                    select: { id_seguidor: true }
                },

                siguiendo: {
                    select: { id_seguido: true }
                },

                publicacion: {
                    select: {
                        imagen: true,
                        id_publicacion: true
                    },
                    orderBy: { fecha_publicacion: "desc" }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const yoLeSigo = user.seguidores.some(s => s.id_seguidor === yo);

        res.json({
            nombre: user.nombre,
            bio: user.biografia,
            seguidores: user.seguidores.length,
            seguidos: user.siguiendo.length,
            publicaciones: user.publicacion,
            yoLeSigo,
            id_usuario: id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ===============================
// PERFIL PÚBLICO (JSON PARA MODAL)
// ===============================
router.get("/perfil-publico/:id/data", requireLogin, obtenerPerfilPublicoData);

// ===============================
// PERFIL PÚBLICO (PÁGINA HTML)
// ===============================
router.get("/perfil-publico/:id", requireLogin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const yo = req.session.user.id;

        const user = await prisma.usuarios.findUnique({
            where: { id_usuario: id },
            select: {
                id_usuario: true,
                nombre: true,
                biografia: true,
                seguidores: { select: { id_seguidor: true } },
                siguiendo: { select: { id_seguido: true } },
                publicacion: {
                    select: {
                        id_publicacion: true,
                        imagen: true,
                        titulo: true,
                        fecha_publicacion: true,
                        numero_visitas: true
                    },
                    orderBy: { fecha_publicacion: "desc" }
                }
            }
        });

        if (!user) return res.status(404).send("Usuario no encontrado");

        const yoLeSigo = user.seguidores.some(s => s.id_seguidor === yo);

        res.render("perfil-publico", {
            usuario: user,
            yoLeSigo,
            esYo: yo === id
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error interno del servidor");
    }
});

module.exports = router;
