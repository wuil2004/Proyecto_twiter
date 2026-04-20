const amqp = require('amqplib');
const User = require('../models/User');
const Post = require('../models/Post');

async function iniciarAntena() {
    try {
        const conexion = await amqp.connect(process.env.RABBITMQ_URL);
        const canal = await conexion.createChannel();

        // --- ESCUCHAR USUARIOS ---
        await canal.assertExchange('usuarios_exchange', 'fanout', { durable: true });
        const qUsuarios = await canal.assertQueue('buzon_buscar_usuarios', { durable: true });
        await canal.bindQueue(qUsuarios.queue, 'usuarios_exchange', '');

        // --- ESCUCHAR POSTS ---
        await canal.assertExchange('posts_exchange', 'fanout', { durable: true });
        const qPosts = await canal.assertQueue('buzon_buscar_posts', { durable: true });
        await canal.bindQueue(qPosts.queue, 'posts_exchange', '');

        console.log(`📻 [RabbitMQ] ms-buscar espiando usuarios y posts...`);

        // Atrapa Usuarios
        canal.consume(qUsuarios.queue, async (mensaje) => {
            if (mensaje !== null) {
                const contenido = JSON.parse(mensaje.content.toString());
                if (contenido.tipo === 'USUARIO_CREADO') {
                    console.log(`🔎 [Buscar] Indexando nuevo usuario: ${contenido.datos.username}`);
                    try {
                        await new User({ _id: contenido.datos.id, username: contenido.datos.username, email: contenido.datos.email }).save();
                    } catch (err) {}
                }
                canal.ack(mensaje);
            }
        });

        // Atrapa Posts
        canal.consume(qPosts.queue, async (mensaje) => {
            if (mensaje !== null) {
                const contenido = JSON.parse(mensaje.content.toString());
                if (contenido.tipo === 'POST_CREADO') {
                    console.log(`🔎 [Buscar] Indexando nuevo tuit para el buscador...`);
                    try {
                        await new Post({ 
                            _id: contenido.datos.id, 
                            texto: contenido.datos.texto, 
                            autorId: contenido.datos.autorId,
                            imagenUrl: contenido.datos.imagenUrl
                        }).save();
                        console.log(`✅ Tuit guardado en buscarDB`);
                    } catch (err) { console.error(err.message); }
                }
                canal.ack(mensaje);
            }
        });

    } catch (error) {
        console.error(`🔴 Error en la antena de Buscar:`, error);
    }
}

module.exports = { iniciarAntena };