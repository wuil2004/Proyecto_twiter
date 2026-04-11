const amqp = require('amqplib');
const User = require('../models/User'); // Importamos tu nuevo modelo

async function iniciarAntena() {
    try {
        const conexion = await amqp.connect(process.env.RABBITMQ_URL);
        const canal = await conexion.createChannel();
        const cola = 'user_events';

        await canal.assertQueue(cola, { durable: true });
        console.log(`📻 [RabbitMQ] ms-posts escuchando en la cola '${cola}'...`);

        canal.consume(cola, async (mensaje) => {
            if (mensaje !== null) {
                const contenido = JSON.parse(mensaje.content.toString());

                // Verificamos de qué trata el mensaje
                if (contenido.tipo === 'USUARIO_CREADO') {
                    console.log(`¡Mensaje atrapado! Guardando copia del usuario: ${contenido.datos.username}`);

                    try {
                        // Guardamos físicamente la copia en postsDB
                        const nuevoUsuario = new User({
                            _id: contenido.datos.id,
                            username: contenido.datos.username,
                            email: contenido.datos.email
                        });
                        await nuevoUsuario.save();
                        console.log(`✅ Usuario guardado exitosamente en postsDB`);
                    } catch (err) {
                        console.error("Error guardando el clon del usuario:", err.message);
                    }
                }

                // 4. Le decimos a RabbitMQ: "Trabajo terminado, borra el mensaje"
                canal.ack(mensaje);
            }
        });

    } catch (error) {
        console.error(`🔴 Error en la antena de RabbitMQ:`, error);
    }
}

module.exports = { iniciarAntena };