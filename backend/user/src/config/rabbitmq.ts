import amql from "amqplib";

let channel: amql.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amql.connect({
      protocol: "amqps",
      hostname: process.env.RABBITMQ_HOST,
      port: 5671,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      vhost: process.env.RABBITMQ_VHOST || "/",
    });

    channel = await connection.createChannel();

    console.log("✅ connected to rabbitmq");
  } catch (error) {
    console.log("Failed to connect to rabbitmq", error);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("Rabbitmq channel is not initalized");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
