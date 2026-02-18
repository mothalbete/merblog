const express = require("express");
const path = require("path");
require("dotenv").config();
const session = require("express-session");

const app = express();

// ===============================
// IMPORTAR RUTAS
// ===============================
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const publicacionesRoutes = require("./routes/publicaciones.routes");
const comentariosRoutes = require("./routes/comentarios.routes");
const perfilRoutes = require("./routes/perfil.routes");
const seguidoresRoutes = require("./routes/seguidores.routes");

// ===============================
// CONFIGURACIÓN EJS
// ===============================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===============================
// MIDDLEWARES GLOBALES
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "mi_secreto_super_seguro",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// ===============================
// USAR RUTAS
// ===============================
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(publicacionesRoutes);
app.use(comentariosRoutes);
app.use(perfilRoutes);
app.use(seguidoresRoutes);

// ===============================
// SERVIDOR
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
