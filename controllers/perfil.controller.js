const prisma = require("../lib/prisma");

// ===============================
// EDITAR PERFIL
// ===============================
exports.editarPerfil = async (req, res) => {
  const { nick, email, biografia } = req.body;

  try {
    const updated = await prisma.usuarios.update({
      where: { id_usuario: req.session.user.id },
      data: {
        nick,
        email,
        biografia
      }
    });

    // Actualizar sesión
    req.session.user.username = updated.nick;

    res.redirect("/dashboard");

  } catch (err) {
    console.error("ERROR EDITANDO PERFIL:", err);

    let msg = "Error al actualizar el perfil";

    if (err.code === "P2002") {
      msg = "El nick o email ya está en uso";
    }

    res.render("dashboard", {
      user: req.session.user,
      publicaciones: [],
      misPublicaciones: [],
      errorPerfil: msg
    });
  }
};

// ===============================
// PERFIL PÚBLICO → JSON PARA MODAL
// ===============================
exports.obtenerPerfilPublicoData = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const yo = req.session.user.id;

        const usuario = await prisma.usuarios.findUnique({
            where: { id_usuario: id },
            select: {
                nombre: true,
                biografia: true,
                seguidores: true,
                siguiendo: true,
                publicacion: {
                    orderBy: { fecha_publicacion: "desc" },
                    include: {
                        likes: { select: { id_usuario: true } }
                    }
                }
            }
        });

        if (!usuario) {
            return res.json({ ok: false });
        }

        // Procesar publicaciones con likes
        const publicaciones = usuario.publicacion.map(pub => ({
            ...pub,
            likesCount: pub.likes.length,
            yaLike: pub.likes.some(l => l.id_usuario === yo)
        }));

        res.json({
            ok: true,
            nombre: usuario.nombre,
            biografia: usuario.biografia,
            seguidores: usuario.seguidores.length,
            seguidos: usuario.siguiendo.length,
            esYo: yo === id,
            yoLeSigo: usuario.seguidores.some(s => s.id_seguidor === yo),
            publicaciones
        });

    } catch (err) {
        console.error("ERROR PERFIL PUBLICO DATA:", err);
        res.json({ ok: false });
    }
};
