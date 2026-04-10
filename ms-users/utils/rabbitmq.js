const amqp = require('amqplib');
async function enviarMensaje(cola, mensaje) {
  try {
    const conexion = await amqp.connect(process.env.RABBITMQ_URL);
    const canal = await conexion.createChannel();
    await canal.assertQueue(cola, { durable: true });
    
    canal.sendToQueue(cola, Buffer.from(JSON.stringify(mensaje)));
    
    console.log(` [RabbitMQ] Mensaje enviado a la cola '${cola}'`);

    setTimeout(() => {
      conexion.close();
    }, 500);

  } catch (error) {
    console.error(` Error en RabbitMQ:`, error);
  }
}

module.exports = { enviarMensaje };