const { Kafka } = require("kafkajs");

exports.kafkaListener = async (telegramManager) => {
  const kafka = new Kafka({
    clientId: "otp-email-bot-client-" + Math.random().toString(36).substring(7),
    brokers: process.env.KAFKA_PRODUCER_BROKER_DB_CHANGE.split(","),
  });
  const consumer = kafka.consumer({
    groupId: "otp-email-bot-group",
    retry: {
      initialRetryTime: 300,
      retries: 30000,
      restartOnFailure: (error) => {
        console.error("restartOnFailure: " + error);
        return true;
      },
    },
  });
  await consumer.connect();

  const admin = kafka.admin();
  await admin.connect();
  consumer.on(consumer.events.CONNECT, async () => {
    console.log("Connected to kafka");
  });
  consumer.on(consumer.events.DISCONNECT, async () => {
    console.log("Disconnected from kafka");
    // const result = await consumer.connect();
    // console.log("Reconnect result", result);
    // startConsumer();
  });

  await consumer.subscribe({
    topics: [process.env.KAFKA_TOPIC_OTP_EMAIL],
    fromBeginning: true,
  });

  const startConsumer = async () => {
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let objReceived;
        try {
          objReceived = JSON.parse(message.value.toString());
          const code = objReceived?.code;
          const email = objReceived?.identification_value;
          const emailEscaped = email.replace(/\./g, "\\.");

          const messageSend = emailEscaped + " \\-\\-\\> `" + code + "`";

          telegramManager.appendMessage(
            messageSend,
            process.env.TELEGRAM_GROUP_ID,
            undefined //process.env.TELEGRAM_TOPIC_ID
          );
        } catch (error) {
          // TODO: add log to mongo
          console.log(error, "Consumer kafka error");
          console.log(objReceived, "objReceived");
        }
      },
    });
  };
  await startConsumer();

  await admin.disconnect();
};
