const amqp = require('amqplib');
const User = require('../models/User');
const Post = require('../models/Post'); // <--- IMPORTANTE: Agregamos el modelo de Post

async function iniciarAntena() {
    try {
        const conexion = await amqp.connect(process.env.RABBITMQ_URL);
        const canal = await conexion.createChannel();

        // ==========================================
        // BUZÓN 1: ESCUCHAR USUARIOS NUEVOS
        // ==========================================
        const exchange = 'usuarios_exchange';
        await canal.assertExchange(exchange, 'fanout', { durable: true });

        const q = await canal.assertQueue('buzon_de_posts', { durable: true });
        await canal.bindQueue(q.queue, exchange, '');

        console.log(`📻 [RabbitMQ] ms-posts escuchando a usuarios y likes...`);

        canal.consume(q.queue, async (mensaje) => {
            if (mensaje !== null) {
                const contenido = JSON.parse(mensaje.content.toString());

                if (contenido.tipo === 'USUARIO_CREADO') {
                    console.log(`¡Atrapado en Posts! Clonando a: ${contenido.datos.username}`);
                    try {
                        const nuevoUsuario = new User({
                            _id: contenido.datos.id,
                            username: contenido.datos.username,
                            email: contenido.datos.email
                        });
                        await nuevoUsuario.save();
                        console.log(`✅ ${contenido.datos.username} guardado en postsDB`);
                    } catch (err) {
                        console.error("Error clonando:", err.message);
                    }
                }
                canal.ack(mensaje);
            }
        });

        // ==========================================
        // BUZÓN 2: ESCUCHAR LIKES ACTUALIZADOS (Lo que flotaba afuera)
        // ==========================================
        await canal.assertExchange('likes_exchange', 'fanout', { durable: true });
        const qLikes = await canal.assertQueue('buzon_posts_likes', { durable: true });
        await canal.bindQueue(qLikes.queue, 'likes_exchange', '');

        canal.consume(qLikes.queue, async (mensaje) => {
            if (mensaje !== null) {
                const contenido = JSON.parse(mensaje.content.toString());

                if (contenido.tipo === 'LIKE_ACTUALIZADO') {
                    try {
                        // Buscamos el post y le actualizamos su número de likes
                        await Post.findByIdAndUpdate(contenido.datos.postId, {
                            likes: contenido.datos.totalLikes
                        });
                        console.log(`✅ [Posts] Post ${contenido.datos.postId} actualizado a ${contenido.datos.totalLikes} likes.`);
                    } catch (err) {
                        console.error('Error al actualizar likes en el post:', err.message);
                    }
                }
                canal.ack(mensaje);
            }
        });

    } catch (error) {
        console.error(`🔴 Error en la antena de RabbitMQ:`, error);
    }
} // <--- AHORA SÍ TERMINA iniciarAntena con todo adentro

// ==========================================
// FUNCIÓN PARA GRITAR (Crear un post)
// ==========================================
async function enviarEventoGlobal(exchange, mensaje) {
    try {
        const conexion = await amqp.connect(process.env.RABBITMQ_URL);
        const canal = await conexion.createChannel();
        await canal.assertExchange(exchange, 'fanout', { durable: true });
        canal.publish(exchange, '', Buffer.from(JSON.stringify(mensaje)));

        console.log(`📢 [RabbitMQ] ¡Aviso transmitido al mundo!`);
        setTimeout(() => conexion.close(), 500);
    } catch (error) {
        console.error(`🔴 Error en RabbitMQ:`, error);
    }
}

// SOLO UN EXPORT AL FINAL
module.exports = { iniciarAntena, enviarEventoGlobal };