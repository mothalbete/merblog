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
