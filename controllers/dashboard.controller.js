const prisma = require("../lib/prisma");

// ===============================
// MOSTRAR DASHBOARD
// ===============================
exports.mostrarDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Todas las publicaciones (feed)
    const publicaciones = await prisma.publicacion.findMany({
      orderBy: { fecha_publicacion: "desc" },
      include: {
        usuarios: {
          select: {
            nombre: true,
            seguidores: true   // 👈 NECESARIO PARA YA-SIGO
          }
        },
        publicacion_etiquetas: true,

        // ⭐ AÑADIMOS LOS LIKES
        likes: {
          select: { id_usuario: true }
        }
      }
    });

    // ⭐ PROCESAR LIKES PARA CADA PUBLICACIÓN
    const publicacionesProcesadas = publicaciones.map(pub => {
      const likesCount = pub.likes.length;
      const yaLike = pub.likes.some(l => l.id_usuario === userId);

      return {
        ...pub,
        likesCount,
        yaLike
      };
    });

    // Publicaciones del usuario
    const misPublicacionesRaw = await prisma.publicacion.findMany({
      where: { id_usuario: userId },
      orderBy: { fecha_publicacion: "desc" },
      include: {
        likes: {
          select: { id_usuario: true }
        }
      }
    });

    // ⭐ PROCESAR LIKES TAMBIÉN EN MIS PUBLICACIONES
    const misPublicaciones = misPublicacionesRaw.map(pub => {
      const likesCount = pub.likes.length;
      const yaLike = pub.likes.some(l => l.id_usuario === userId);

      return {
        ...pub,
        likesCount,
        yaLike
      };
    });

    // Datos del usuario
    const userData = await prisma.usuarios.findUnique({
      where: { id_usuario: userId },
      select: { email: true, biografia: true }
    });

    // Fechas únicas
    const fechasDisponibles = await prisma.publicacion.findMany({
      select: { fecha_publicacion: true },
      distinct: ["fecha_publicacion"],
      orderBy: { fecha_publicacion: "desc" }
    });

    // Etiquetas únicas
    const etiquetasDisponibles = await prisma.publicacion_etiquetas.findMany({
      select: { etiqueta: true },
      distinct: ["etiqueta"],
      orderBy: { etiqueta: "asc" }
    });

    // ===============================
    // CONTADORES DE SEGUIDORES
    // ===============================

    const seguidoresCount = await prisma.seguidores.count({
      where: { id_seguido: userId }
    });

    const seguidosCount = await prisma.seguidores.count({
      where: { id_seguidor: userId }
    });

    // Render
    res.render("dashboard", {
      user: {
        ...req.session.user,
        email: userData.email,
        biografia: userData.biografia
      },
      publicaciones: publicacionesProcesadas,   // ⭐ YA CON LIKES
      misPublicaciones,                        // ⭐ YA CON LIKES
      fechasDisponibles,
      etiquetasDisponibles,
      seguidoresCount,
      seguidosCount
    });

  } catch (err) {
    console.error("ERROR MOSTRANDO DASHBOARD:", err);
    res.status(500).send("Error cargando dashboard");
  }
};
