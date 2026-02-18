const prisma = require("../lib/prisma");

// ===============================
// SEGUIR A UN USUARIO
// ===============================
exports.seguirUsuario = async (req, res) => {
  const idSeguido = parseInt(req.params.id);
  const idSeguidor = req.session.user.id;

  try {
    // Evitar seguirse a uno mismo
    if (idSeguido === idSeguidor) {
      return res.status(400).json({ error: "No puedes seguirte a ti mismo" });
    }

    // Evitar duplicados
    const existe = await prisma.seguidores.findUnique({
      where: {
        id_seguidor_id_seguido: {
          id_seguidor: idSeguidor,
          id_seguido: idSeguido
        }
      }
    });

    if (existe) {
      return res.status(400).json({ error: "Ya sigues a este usuario" });
    }

    // Crear relación
    await prisma.seguidores.create({
      data: {
        id_seguidor: idSeguidor,
        id_seguido: idSeguido
      }
    });

    res.json({ ok: true });

  } catch (err) {
    console.error("ERROR AL SEGUIR:", err);
    res.status(500).json({ error: "Error al seguir al usuario" });
  }
};

// ===============================
// DEJAR DE SEGUIR A UN USUARIO
// ===============================
exports.dejarDeSeguirUsuario = async (req, res) => {
  const idSeguido = parseInt(req.params.id);
  const idSeguidor = req.session.user.id;

  try {
    await prisma.seguidores.delete({
      where: {
        id_seguidor_id_seguido: {
          id_seguidor: idSeguidor,
          id_seguido: idSeguido
        }
      }
    });

    res.json({ ok: true });

  } catch (err) {
    console.error("ERROR AL DEJAR DE SEGUIR:", err);
    res.status(500).json({ error: "Error al dejar de seguir al usuario" });
  }
};

// ===============================
// OBTENER LISTA DE SEGUIDORES
// ===============================
exports.obtenerSeguidores = async (req, res) => {
  const idUsuario = parseInt(req.params.id);

  try {
    const seguidores = await prisma.seguidores.findMany({
      where: { id_seguido: idUsuario },
      include: {
        seguidor: {
          select: { id_usuario: true, nick: true, nombre: true }
        }
      }
    });

    res.json(
      seguidores.map(s => ({
        id: s.seguidor.id_usuario,
        nick: s.seguidor.nick,
        nombre: s.seguidor.nombre
      }))
    );

  } catch (err) {
    console.error("ERROR OBTENIENDO SEGUIDORES:", err);
    res.status(500).json({ error: "Error obteniendo seguidores" });
  }
};

// ===============================
// OBTENER LISTA DE SEGUIDOS
// ===============================
exports.obtenerSeguidos = async (req, res) => {
  const idUsuario = parseInt(req.params.id);

  try {
    const seguidos = await prisma.seguidores.findMany({
      where: { id_seguidor: idUsuario },
      include: {
        seguido: {
          select: { id_usuario: true, nick: true, nombre: true }
        }
      }
    });

    res.json(
      seguidos.map(s => ({
        id: s.seguido.id_usuario,
        nick: s.seguido.nick,
        nombre: s.seguido.nombre
      }))
    );

  } catch (err) {
    console.error("ERROR OBTENIENDO SEGUIDOS:", err);
    res.status(500).json({ error: "Error obteniendo seguidos" });
  }
};
