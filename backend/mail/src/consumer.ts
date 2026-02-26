import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    const channel = await connection.createChannel();
    const queueName = "send-otp";

    await channel.assertQueue(queueName, { durable: true });
    console.log(`Waiting for messages in ${queueName} queue...`);

    channel.consume(queueName, async (message) => {
      if (message) {
        const { to, subject, body } = JSON.parse(message.content.toString());

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"ChatApp" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          text: body,
        });

        console.log(`OTP email sent to ${to}`);
        channel.ack(message);
      }
    });
  } catch (err) {
    console.log("Error in send-otp consumer:", err);
  }
};
