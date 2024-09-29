const amqp = require("amqplib");

const _sendMessage = async function sendMessage(queue, message) {
  try {
    // Create a connection to the RabbitMQ server
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    // Ensure the queue exists
    await channel.assertQueue(queue, {
      durable: true,
    });

    // Convert the message object to a JSON string
    const messageBuffer = Buffer.from(JSON.stringify(message));

    // Send the message to the queue
    channel.sendToQueue(queue, messageBuffer, {
      persistent: true,
    });

    console.log(`[x] Sent '${messageBuffer}'`);

    // Close the connection
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error in sending message:", error);
  }
};

module.exports = {
  _sendMessage,
};
