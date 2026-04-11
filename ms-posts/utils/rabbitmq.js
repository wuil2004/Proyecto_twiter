const amqp = require('amqplib');
const User = require('../models/User');

async function iniciarAntena() {
    try {
        const conexion = await amqp.connect(process.env.RABBITMQ_URL);
        const canal = await conexion.createChannel();

        const exchange = 'usuarios_exchange';
        await canal.assertExchange(exchange, 'fanout', { durable: true });

        const q = await canal.assertQueue('buzon_de_posts', { durable: true });
        await canal.bindQueue(q.queue, exchange, '');

        console.log(`📻 [RabbitMQ] ms-posts conectado al megáfono '${exchange}'...`);

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

    } catch (error) {
        console.error(`🔴 Error en la antena de RabbitMQ:`, error);
    }
} // <--- AQUÍ TERMINA iniciarAntena (Esta era la llave que faltaba)

// ==========================================
// NUEVO: FUNCIÓN PARA GRITAR
// ==========================================
async function enviarEventoGlobal(exchange, mensaje) {
    try {
        const conexion = await amqp.connect(process.env.RABBITMQ_URL);
        const canal = await conexion.createChannel();
        await canal.assertExchange(exchange, 'fanout', { durable: true });
        canal.publish(exchange, '', Buffer.from(JSON.stringify(mensaje)));

        console.log(`📢 [RabbitMQ] ¡Aviso de nuevo tuit transmitido!`);
        setTimeout(() => conexion.close(), 500);
    } catch (error) { 
        console.error(`🔴 Error en RabbitMQ:`, error); 
    }
}

// SOLO UN EXPORT AL FINAL
module.exports = { iniciarAntena, enviarEventoGlobal };