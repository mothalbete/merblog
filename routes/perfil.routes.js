const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const { editarPerfil } = require("../controllers/perfil.controller");

// ===============================
// EDITAR PERFIL
// ===============================
router.post("/perfil/editar", requireLogin, editarPerfil);

module.exports = router;

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
            publicaciones: user.publicacion,   // 👈 nombre correcto
            yoLeSigo,
            id_usuario: id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


