const amqp = require("amqplib");
const analyticController = require("../controllers/analyticController");

const receiveMessage = async function (queue) {
  try {
    // Create a connection to the RabbitMQ server
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

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

          // Mock `req` and `res` objects to pass to the controller
          const req = {
            userId: messageContent.userId,
            ticketId: messageContent.ticketId,
            resolutionTime: messageContent.resolutionTime,
          };
          const res = {
            status: (code) => ({
              json: (responseData) => console.log(`Response:`, responseData),
            }),
          };

          // Call the notification controller with the mock request and response
          analyticController.createOne(req, res);

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
};

// Start consuming messages from the queue
receiveMessage("ticket_analytic");
