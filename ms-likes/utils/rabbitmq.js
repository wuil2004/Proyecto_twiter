const amqp = require('amqplib');
const User = require('../models/User');
const Like = require('../models/Like'); // Importamos el molde nuevo

async function iniciarAntena() {
    try {
        const conexion = await amqp.connect(process.env.RABBITMQ_URL);
        const canal = await conexion.createChannel();

        // --- BUZÓN 1: ESCUCHAR USUARIOS ---
        await canal.assertExchange('usuarios_exchange', 'fanout', { durable: true });
        const qUsuarios = await canal.assertQueue('buzon_likes_usuarios', { durable: true });
        await canal.bindQueue(qUsuarios.queue, 'usuarios_exchange', '');

        // --- BUZÓN 2: ESCUCHAR POSTS ---
        await canal.assertExchange('posts_exchange', 'fanout', { durable: true });
        const qPosts = await canal.assertQueue('buzon_likes_posts', { durable: true });
        await canal.bindQueue(qPosts.queue, 'posts_exchange', '');

        console.log(`📻 [RabbitMQ] ms-likes escuchando usuarios y posts...`);

        // Escuchar cuando nace un Usuario
        canal.consume(qUsuarios.queue, async (mensaje) => {
            if (mensaje !== null) {
                const contenido = JSON.parse(mensaje.content.toString());
                if (contenido.tipo === 'USUARIO_CREADO') {
                    console.log(`¡Atrapado en Likes! Clonando a: ${contenido.datos.username}`);
                    try {
                        const nuevoUsuario = new User({ _id: contenido.datos.id, username: contenido.datos.username, email: contenido.datos.email });
                        await nuevoUsuario.save();
                    } catch (err) { }
                }
                canal.ack(mensaje);
            }
        });

        // Escuchar cuando nace un Tuit
        canal.consume(qPosts.queue, async (mensaje) => {
            if (mensaje !== null) {
                const contenido = JSON.parse(mensaje.content.toString());
                if (contenido.tipo === 'POST_CREADO') {
                    console.log(`¡Atrapado en Likes! Creando contador en 0 para el post: ${contenido.datos.id}`);
                    try {
                        // Creamos el contador de likes en 0 para ese tuit
                        const nuevoRegistro = new Like({ postId: contenido.datos.id });
                        await nuevoRegistro.save();
                        console.log(`✅ Contador creado exitosamente`);
                    } catch (err) { console.error(err.message); }
                }
                canal.ack(mensaje);
            }
        });

    } catch (error) {
        console.error(`🔴 Error en la antena de RabbitMQ:`, error);
    }
}

module.exports = { iniciarAntena };