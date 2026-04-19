const verificarToken = require('./middlewares/auth');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
//const { enviarMensaje } = require('./utils/rabbitmq');
const { enviarEventoGlobal } = require('./utils/rabbitmq');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Conectado exitosamente al Clúster de MongoDB (rs-users)'))
  .catch(err => console.error(' Error conectando a MongoDB:', err));

app.get('/', (req, res) => {
  res.json({ mensaje: "API de Usuarios funcionando a la perfección" });
});

app.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const nuevoUsuario = new User({ username, email, password });
    await nuevoUsuario.save();

    const evento = {
      tipo: 'USUARIO_CREADO',
      datos: { id: nuevoUsuario._id, username: nuevoUsuario.username, email: nuevoUsuario.email }
    };
    //enviarMensaje('user_events', evento);
    enviarEventoGlobal('usuarios_exchange', evento);

    res.status(201).json({ usuario: nuevoUsuario });
  } catch (error) {
    res.status(400).json({ error: "Error al crear usuario", detalle: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const contraseñaValida = await bcrypt.compare(password, usuario.password);
    if (!contraseñaValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: usuario._id, username: usuario.username },
      process.env.SECRET_KEY,
      { expiresIn: '2h' }
    );

    // 👇 AQUÍ ESTÁ LA MAGIA 👇
    res.json({
      token: token,
      usuario: {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Error en el servidor al intentar iniciar sesión" });
  }
});
app.get('/perfil', verificarToken, (req, res) => {

  res.json({
    tuInformacion: req.usuario
  });
});

app.listen(port, () => {
  console.log(`ms-users corriendo en el puerto ${port}`);
});