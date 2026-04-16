const express = require('express');
const mongoose = require('mongoose');
const { iniciarAntena, enviarEventoGlobal } = require('./utils/rabbitmq');
const verificarToken = require('./middlewares/auth'); 
const Like = require('./models/Like'); 

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(' Conectado exitosamente a likesDB');
        iniciarAntena();
    })
    .catch(err => console.error(' Error conectando a MongoDB:', err));
/*
app.get('/', (req, res) => {
    res.json({ mensaje: "¡El microservicio de Likes está vivo y actualizado!" });
});
*/

app.post('/:postId/toggle', verificarToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const usuarioId = req.usuario.id; 

        
        const registro = await Like.findOne({ postId: postId });

        if (!registro) {
            return res.status(404).json({ error: "El post no existe o no tiene contador" });
        }


        const indiceUsuario = registro.usuariosQueDieronLike.indexOf(usuarioId);

        if (indiceUsuario === -1) {
            
            registro.cantidad += 1;
            registro.usuariosQueDieronLike.push(usuarioId);
        } else {
            
            registro.cantidad -= 1;
            registro.usuariosQueDieronLike.splice(indiceUsuario, 1);
        }

        await registro.save();

        // 👇 ¡NUEVO! Le avisamos al mundo que este post actualizó sus likes
        const eventoLike = {
            tipo: 'LIKE_ACTUALIZADO',
            datos: {
                postId: postId,
                totalLikes: registro.cantidad
            }
        };
        enviarEventoGlobal('likes_exchange', eventoLike);

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