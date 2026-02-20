const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ===============================
// DAR LIKE
// ===============================
exports.darLike = async (req, res) => {
    try {
        const id_publicacion = parseInt(req.params.id_publicacion);
        const id_usuario = req.session.user.id;

        // Comprobar si ya existe
        const existe = await prisma.likes.findUnique({
            where: {
                id_usuario_id_publicacion: {
                    id_usuario,
                    id_publicacion
                }
            }
        });

        if (existe) {
            return res.json({ ok: false, msg: "Ya diste like" });
        }

        await prisma.likes.create({
            data: {
                id_usuario,
                id_publicacion
            }
        });

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false });
    }
};

// ===============================
// QUITAR LIKE
// ===============================
exports.quitarLike = async (req, res) => {
    try {
        const id_publicacion = parseInt(req.params.id_publicacion);
        const id_usuario = req.session.user.id;

        await prisma.likes.delete({
            where: {
                id_usuario_id_publicacion: {
                    id_usuario,
                    id_publicacion
                }
            }
        });

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false });
    }
};
