const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");

// ===============================
// MOSTRAR LANDING
// ===============================
exports.mostrarLanding = (req, res) => {
  res.render("index", {
    errorLogin: null,
    errorRegister: null,
    user: req.session.user || null
  });
};

// ===============================
// LOGIN (POST)
// ===============================
exports.login = async (req, res) => {
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
};

// ===============================
// REGISTRO (POST)
// ===============================
exports.register = async (req, res) => {
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
};

// ===============================
// LOGOUT
// ===============================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
