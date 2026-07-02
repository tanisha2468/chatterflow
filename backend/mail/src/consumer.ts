import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqps",
      hostname: process.env.RABBITMQ_HOST,
      port: 5671,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      vhost: process.env.RABBITMQ_VHOST || "/",
    });

    const channel = await connection.createChannel();
    const queueName = "send-otp";
    await channel.assertQueue(queueName, { durable: true });
    console.log("✅ Mail Service consumer started, listening for otp emails");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());

          const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": process.env.BREVO_API_KEY as string,
            },
            body: JSON.stringify({
              sender: { email: "tanishagoyal2468@gmail.com", name: "chatapp" },
              to: [{ email: to }],
              subject,
              textContent: body,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Brevo error: ${response.status} ${errText}`);
          }

          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send otp", error);
        }
      }
    });
  } catch (error) {
    console.log("Failed to start rabbitmq consumer", error);
  }
};
