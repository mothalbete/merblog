// Middleware para proteger rutas que requieren sesión activa
exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
};
