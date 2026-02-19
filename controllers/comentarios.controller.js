const prisma = require("../lib/prisma");

// ===============================
// CREAR COMENTARIO
// ===============================
exports.crearComentario = async (req, res) => {
  const id_publicacion = parseInt(req.params.id);
  const { texto } = req.body;

  try {
    await prisma.comentario.create({
      data: {
        texto,
        id_usuario: req.session.user.id,
        id_publicacion
      }
    });

    // 🔥 Respuesta JSON para AJAX (no recarga la página)
    res.json({ ok: true });

  } catch (err) {
    console.error("ERROR CREANDO COMENTARIO:", err);
    res.status(500).json({ error: "Error al enviar comentario" });
  }
};
