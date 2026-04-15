const express = require('express');
const mongoose = require('mongoose');
const { iniciarAntena } = require('./utils/rabbitmq');
const verificarToken = require('./middlewares/auth');
const Post = require('./models/Post');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(' Conectado exitosamente a buscarDB');
        iniciarAntena();
    })
    .catch(err => console.error(' Error conectando a MongoDB:', err));

app.get('/', verificarToken, async (req, res) => {
    try {
        const palabraClave = req.query.q; 

        if (!palabraClave) {
            return res.status(400).json({ error: "Debes ingresar una palabra a buscar usando ?q=tu_palabra" });
        }

        const usuariosEncontrados = await User.find({
            username: { $regex: palabraClave, $options: 'i' }
        });
        
        const idsDeUsuarios = usuariosEncontrados.map(user => user._id);

        const resultados = await Post.find({
            $or: [
                { texto: { $regex: palabraClave, $options: 'i' } },
                { autorId: { $in: idsDeUsuarios } }
            ]
        })
        .populate('autorId', 'username')
        .sort({ _id: -1 });

        res.json({
            mensaje: `Búsqueda completada para: "${palabraClave}"`,
            totalEncontrados: resultados.length,
            resultados: resultados
        });

    } catch (error) {
        res.status(500).json({ error: "Error en el buscador", detalle: error.message });
    }
});

app.listen(port, () => {
    console.log(`ms-buscar corriendo en el puerto ${port}`);
});