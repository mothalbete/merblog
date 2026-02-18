const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcrypt");
const multer = require("multer");

const prisma = new PrismaClient();

// ===============================
// CONFIGURACIÓN MULTER (IMÁGENES)
// ===============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ===============================
// CONFIGURACIÓN EJS
// ===============================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===============================
// MIDDLEWARES
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'mi_secreto_super_seguro',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware para proteger rutas
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

// ===============================
// LANDING
// ===============================
app.get("/", (req, res) => {
  res.render("index", { 
    errorLogin: null,
    errorRegister: null,
    user: req.session.user || null
  });
});

// ===============================
// REDIRECCIÓN DE /login y /register
// ===============================
app.get("/login", (req, res) => res.redirect("/"));
app.get("/register", (req, res) => res.redirect("/"));

// ===============================
// DASHBOARD
// ===============================
app.get("/dashboard", requireLogin, async (req, res) => {
  try {
    const publicaciones = await prisma.publicacion.findMany({
      orderBy: { fecha_publicacion: "desc" },
      include: {
        usuarios: { select: { nombre: true } }
      }
    });

    const misPublicaciones = await prisma.publicacion.findMany({
      where: { id_usuario: req.session.user.id },
      orderBy: { fecha_publicacion: "desc" }
    });

    const userData = await prisma.usuarios.findUnique({
      where: { id_usuario: req.session.user.id },
      select: { email: true, biografia: true }
    });

    res.render("dashboard", {
      user: {
        ...req.session.user,
        email: userData.email,
        biografia: userData.biografia
      },
      publicaciones,
      misPublicaciones
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error cargando dashboard");
  }
});

// ===============================
// LOGIN (POST)
// ===============================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { nick: username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.render("index", { 
        errorLogin: "Credenciales incorrectas",
        errorRegister: null,
        user: null
      });
    }

    const passwordMatch = await bcrypt.compare(password, user["contraseña"]);

    if (!passwordMatch) {
      return res.render("index", { 
        errorLogin: "Credenciales incorrectas",
        errorRegister: null,
        user: null
      });
    }

    req.session.user = { 
      id: user.id_usuario, 
      username: user.nick
    };

    return res.redirect("/dashboard");

  } catch (err) {
    console.error("ERROR EN LOGIN:", err);
    res.render("index", { 
      errorLogin: "Error interno",
      errorRegister: null,
      user: null
    });
  }
});

// ===============================
// REGISTRO (POST)
// ===============================
app.post("/register", async (req, res) => {
  const { nick, username, email, password } = req.body;

  if (!nick || !username || !email || !password) {
    return res.render("index", { 
      errorRegister: "Todos los campos son obligatorios",
      errorLogin: null,
      user: null
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.usuarios.create({
      data: { 
        nick: nick,
        nombre: username,
        email: email,
        contraseña: hashedPassword
      }
    });

    req.session.user = {
      id: newUser.id_usuario,
      username: newUser.nick
    };

    return res.redirect("/dashboard");

  } catch (err) {
    console.error("ERROR REGISTER:", err);

    if (err.code === "P2002") {
      return res.render("index", { 
        errorRegister: "El nick o email ya existe",
        errorLogin: null,
        user: null
      });
    }

    res.render("index", { 
      errorRegister: "Error al registrar usuario",
      errorLogin: null,
      user: null
    });
  }
});

// ===============================
// LOGOUT
// ===============================
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ===============================
// CREAR PUBLICACIÓN
// ===============================
app.post("/publicaciones/nueva", requireLogin, upload.single("imagen"), async (req, res) => {
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
    console.error(err);
    res.status(500).send("Error al crear la publicación");
  }
});

// ===============================
// CREAR COMENTARIO
// ===============================
app.post("/comentarios/:id", requireLogin, async (req, res) => {
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

    res.redirect("/dashboard");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error al enviar comentario");
  }
});

// ===============================
// OBTENER PUBLICACIÓN PARA MODAL
// ===============================
app.get("/publicaciones/:id", requireLogin, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const pub = await prisma.publicacion.findUnique({
      where: { id_publicacion: id },
      include: {
        usuarios: { select: { nombre: true } },
        publicacion_etiquetas: { select: { etiqueta: true } },
        comentario: {
          orderBy: { fecha_comentario: "desc" },
          include: { usuarios: { select: { nombre: true } } }
        }
      }
    });

    if (!pub) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    await prisma.publicacion.update({
      where: { id_publicacion: id },
      data: { numero_visitas: { increment: 1 } }
    });

    const respuesta = {
      id: pub.id_publicacion,
      titulo: pub.titulo,
      contenido: pub.contenido,
      imagen: pub.imagen,
      autor: pub.usuarios.nombre,
      fecha: pub.fecha_publicacion,
      visitas: pub.numero_visitas,
      etiquetas: pub.publicacion_etiquetas.map(e => e.etiqueta),
      comentarios: pub.comentario.map(c => ({
        autor: c.usuarios.nombre,
        texto: c.texto,
        fecha: c.fecha_comentario
      }))
    };

    res.json(respuesta);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo publicación" });
  }
});

// ===============================
// SERVIDOR
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

// ===============================
// PERFIL
// ===============================
app.post("/perfil/editar", requireLogin, async (req, res) => {
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

    // Actualizamos la sesión con el nuevo nick
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
});
