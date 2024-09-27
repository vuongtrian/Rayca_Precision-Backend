const amqp = require("amqplib");

async function receiveMessage() {
  try {
    // Create a connection to the RabbitMQ server
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    const queue = "ticket_notification";

    // Ensure the queue exists
    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(`[x] Waiting for messages in ${queue}. To exit press CTRL+C`);

    // Consume messages from the queue
    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          // Parse the message content from JSON string back into an object
          const messageContent = JSON.parse(msg.content.toString());

          console.log(`[x] Received message:`, messageContent);
          // Acknowledge the message
          channel.ack(msg);
        }
      },
      {
        noAck: false, // Ensure message acknowledgment
      }
    );
  } catch (error) {
    console.error("Error in receiving message:", error);
  }
}

receiveMessage();
