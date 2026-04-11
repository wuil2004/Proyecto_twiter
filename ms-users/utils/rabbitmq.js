const amqp = require('amqplib');

async function enviarEventoGlobal(exchange, mensaje) {
  try {
    const conexion = await amqp.connect(process.env.RABBITMQ_URL);
    const canal = await conexion.createChannel();
    
    // 1. Configuramos un Megáfono (Exchange) de tipo 'fanout' (que grita a todos)
    await canal.assertExchange(exchange, 'fanout', { durable: true });
    
    // 2. Transmitimos el mensaje al aire
    canal.publish(exchange, '', Buffer.from(JSON.stringify(mensaje)));
    
    console.log(`📢 [RabbitMQ] Evento global transmitido por '${exchange}'`);
    
    setTimeout(() => {
      conexion.close();
    }, 500);

  } catch (error) {
    console.error(`🔴 Error en RabbitMQ:`, error);
  }
}

module.exports = { enviarEventoGlobal };