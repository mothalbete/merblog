const prisma = require("../lib/prisma");

// ===============================
// CREAR PUBLICACIÓN
// ===============================
exports.crearPublicacion = async (req, res) => {
  try {
    const { titulo, contenido, estado, etiquetas } = req.body;

    const imagenRuta = req.file ? "/uploads/" + req.file.filename : null;

    const nueva = await prisma.publicacion.create({
      data: {
        titulo,
        contenido,
        estado,
        imagen: imagenRuta,
        id_usuario: req.session.user.id
      }
    });

    if (etiquetas && etiquetas.trim() !== "") {
      const lista = etiquetas.split(",").map(e => e.trim());

      for (let et of lista) {
        await prisma.publicacion_etiquetas.create({
          data: {
            id_publicacion: nueva.id_publicacion,
            etiqueta: et
          }
        });
      }
    }

    res.redirect("/dashboard");

  } catch (err) {
    console.error("ERROR CREANDO PUBLICACIÓN:", err);
    res.status(500).send("Error al crear la publicación");
  }
};

// ===============================
// ELIMINAR PUBLICACIÓN
// ===============================
exports.eliminarPublicacion = async (req, res) => {
  const id_publicacion = parseInt(req.params.id);

  try {
    const pub = await prisma.publicacion.findUnique({
      where: { id_publicacion }
    });

    if (!pub) {
      return res.status(404).send("Publicación no encontrada");
    }

    if (pub.id_usuario !== req.session.user.id) {
      return res.status(403).send("No tienes permiso para eliminar esta publicación");
    }

    await prisma.publicacion.delete({
      where: { id_publicacion }
    });

    res.redirect("/dashboard");

  } catch (err) {
    console.error("ERROR ELIMINANDO PUBLICACIÓN:", err);
    res.status(500).send("Error al eliminar la publicación");
  }
};

// ===============================
// OBTENER PUBLICACIÓN (LECTURA)
// ===============================
exports.obtenerPublicacion = async (req, res) => {
  const id = parseInt(req.params.id);
  const yo = req.session.user.id;

  try {
    const pub = await prisma.publicacion.findUnique({
      where: { id_publicacion: id },
      include: {
        usuarios: { 
          select: { 
            id_usuario: true, 
            nombre: true,
            seguidores: { select: { id_seguidor: true } }
          } 
        },
        publicacion_etiquetas: { select: { etiqueta: true } },
        likes: { select: { id_usuario: true } },
        comentario: {
          orderBy: { fecha_comentario: "desc" },
          include: {
            usuarios: {
              select: {
                id_usuario: true,
                nombre: true,
                seguidores: { select: { id_seguidor: true } }
              }
            }
          }
        }
      }
    });

    if (!pub) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    // Incrementar visitas
    await prisma.publicacion.update({
      where: { id_publicacion: id },
      data: { numero_visitas: { increment: 1 } }
    });

    // Procesar likes
    const likesCount = pub.likes.length;
    const yaLike = pub.likes.some(l => l.id_usuario === yo);

    // Procesar comentarios
    const comentarios = pub.comentario.map(c => ({
      autor: c.usuarios.nombre,
      id_usuario: c.usuarios.id_usuario,
      texto: c.texto,
      fecha: c.fecha_comentario,
      yoSoyEl: c.usuarios.id_usuario === yo,
      esAutor: c.usuarios.id_usuario === pub.id_usuario,
      yoLeSigo: c.usuarios.seguidores.some(s => s.id_seguidor === yo)
    }));

    const respuesta = {
      id: pub.id_publicacion,
      titulo: pub.titulo,
      contenido: pub.contenido,
      imagen: pub.imagen,
      autor: pub.usuarios.nombre,
      id_usuario: pub.usuarios.id_usuario,
      fecha: pub.fecha_publicacion,
      visitas: pub.numero_visitas,
      propietario: pub.id_usuario === yo,
      etiquetas: pub.publicacion_etiquetas.map(e => e.etiqueta),
      likesCount,
      yaLike,
      yoLeSigo: pub.usuarios.seguidores.some(s => s.id_seguidor === yo),
      comentarios
    };

    res.json(respuesta);

  } catch (err) {
    console.error("ERROR OBTENIENDO PUBLICACIÓN:", err);
    res.status(500).json({ error: "Error obteniendo publicación" });
  }
};

// ===============================
// OBTENER DATOS PARA EDITAR
// ===============================
exports.obtenerPublicacionParaEditar = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const pub = await prisma.publicacion.findUnique({
      where: { id_publicacion: id },
      include: {
        publicacion_etiquetas: true
      }
    });

    if (!pub) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    if (pub.id_usuario !== req.session.user.id) {
      return res.status(403).json({ error: "No tienes permiso para editar esta publicación" });
    }

    res.json({
      id: pub.id_publicacion,
      titulo: pub.titulo,
      contenido: pub.contenido,
      estado: pub.estado,
      etiquetas: pub.publicacion_etiquetas.map(e => e.etiqueta)
    });

  } catch (err) {
    console.error("ERROR OBTENIENDO PUBLICACIÓN PARA EDITAR:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// ===============================
// EDITAR PUBLICACIÓN
// ===============================
exports.editarPublicacion = async (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, contenido, estado, etiquetas } = req.body;

  try {
    const pub = await prisma.publicacion.findUnique({
      where: { id_publicacion: id }
    });

    if (!pub) {
      return res.status(404).send("Publicación no encontrada");
    }

    if (pub.id_usuario !== req.session.user.id) {
      return res.status(403).send("No tienes permiso para editar esta publicación");
    }

    const nuevaImagen = req.file ? "/uploads/" + req.file.filename : pub.imagen;

    await prisma.publicacion.update({
      where: { id_publicacion: id },
      data: {
        titulo,
        contenido,
        estado,
        imagen: nuevaImagen
      }
    });

    await prisma.publicacion_etiquetas.deleteMany({
      where: { id_publicacion: id }
    });

    if (etiquetas && etiquetas.trim() !== "") {
      const lista = etiquetas.split(",").map(e => e.trim());

      for (let et of lista) {
        await prisma.publicacion_etiquetas.create({
          data: {
            id_publicacion: id,
            etiqueta: et
          }
        });
      }
    }

    res.redirect("/dashboard");

  } catch (err) {
    console.error("ERROR EDITANDO PUBLICACIÓN:", err);
    res.status(500).send("Error al editar la publicación");
  }
};
