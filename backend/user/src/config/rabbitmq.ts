//this code is actually the producer code, which will be used to send messages to the queue. The consumer code will be in the mail service, which will listen to the queue and process the messages accordingly. this code doesnt really send the email.
import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    channel = await connection.createChannel();
    console.log("connected to rabbitmq 🐰");
  } catch (err) {
    console.log("failed to connect to rabbitmq", err);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("rabbitmq channel not initialized");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
