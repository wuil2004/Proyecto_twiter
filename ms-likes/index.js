const express = require('express');
const mongoose = require('mongoose');
const { iniciarAntena } = require('./utils/rabbitmq');
const verificarToken = require('./middlewares/auth'); // El guardia
const Like = require('./models/Like'); // El molde

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('🟢 Conectado exitosamente a likesDB');
        iniciarAntena();
    })
    .catch(err => console.error('🔴 Error conectando a MongoDB:', err));

// Agrega esto arriba de app.post('/:postId/toggle' ... )
app.get('/', (req, res) => {
    res.json({ mensaje: "¡El microservicio de Likes está vivo y actualizado!" });
});

// ==========================================
// RUTA: DAR O QUITAR "ME GUSTA"
// ==========================================
app.post('/:postId/toggle', verificarToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const usuarioId = req.usuario.id; 

        // 1. Buscamos el registro de likes de este tuit específico
        const registro = await Like.findOne({ postId: postId });

        if (!registro) {
            return res.status(404).json({ error: "El post no existe o no tiene contador" });
        }

        // 2. Revisamos si el usuario ya le había dado like antes
        const indiceUsuario = registro.usuariosQueDieronLike.indexOf(usuarioId);

        if (indiceUsuario === -1) {
            // Si NO estaba en la lista, le sumamos 1
            registro.cantidad += 1;
            registro.usuariosQueDieronLike.push(usuarioId);
        } else {
            // Si YA estaba en la lista, le restamos 1
            registro.cantidad -= 1;
            registro.usuariosQueDieronLike.splice(indiceUsuario, 1);
        }

        // 3. Guardamos los cambios
        await registro.save();

        res.json({
            mensaje: "Like actualizado con éxito",
            totalLikes: registro.cantidad,
            leDisteLike: indiceUsuario === -1 
        });

    } catch (error) {
        res.status(500).json({ error: "Error al procesar el like", detalle: error.message });
    }
});

app.listen(port, () => {
    console.log(`ms-likes corriendo en el puerto ${port}`);
});