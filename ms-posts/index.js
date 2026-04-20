const express = require('express');
const mongoose = require('mongoose');
const { iniciarAntena, enviarEventoGlobal } = require('./utils/rabbitmq');
const verificarToken = require('./middlewares/auth');
const Post = require('./models/Post');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(' Conectado exitosamente a postsDB');
        iniciarAntena();
    })
    .catch(err => console.error(' Error conectando a MongoDB:', err));

app.post('/', verificarToken, async (req, res) => {
    try {
        // 1. Ahora también extraemos la imagenUrl del body
        const { texto, imagenUrl } = req.body; 
        
        if (!texto) return res.status(400).json({ error: "El tuit no puede estar vacío" });

        // 2. Agregamos la imagenUrl al crear el nuevo post
        const nuevoPost = new Post({ 
            texto: texto, 
            autorId: req.usuario.id,
            imagenUrl: imagenUrl || null // Si no hay imagen, guarda null
        });
        await nuevoPost.save();

        // 3. Incluimos la imagenUrl en el grito de RabbitMQ
        const evento = {
            tipo: 'POST_CREADO',
            datos: {
                id: nuevoPost._id,
                texto: nuevoPost.texto,   
                autorId: nuevoPost.autorId,
                imagenUrl: nuevoPost.imagenUrl // <--- Novedad
            }
        };
        enviarEventoGlobal('posts_exchange', evento);

        res.status(201).json({
            mensaje: "¡Tuit publicado con éxito!",
            post: nuevoPost,
            autor: req.usuario.username
        });
    } catch (error) {
        res.status(500).json({ error: "Error al publicar el tuit", detalle: error.message });
    }
});

// ==========================================
// RUTA 2: LEER EL TIMELINE (EL MURO)
// ==========================================
// Mantenemos al guardia (verificarToken) para que solo usuarios logueados puedan leer el muro
app.get('/', verificarToken, async (req, res) => {
    try {
        // 1. Buscamos TODOS los tuits en la base de datos
        const posts = await Post.find()
            // 2. .populate() es magia: Va a la colección de usuarios clonados y trae su nombre
            .populate('autorId', 'username')
            // 3. .sort() los ordena por fecha de creación (-1 significa de más nuevo a más viejo)
            .sort({ fechaCreacion: -1 });

        res.json({
            mensaje: "Timeline cargado con éxito",
            totalTuits: posts.length,
            muro: posts
        });

    } catch (error) {
        res.status(500).json({ error: "Error al obtener el timeline", detalle: error.message });
    }
});

app.listen(port, () => {
    console.log(`ms-posts corriendo en el puerto ${port}`);
});