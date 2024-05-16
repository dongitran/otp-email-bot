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
      retries: 3000,
      restartOnFailure: () => true,
    },
  });

  const startConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({
      topics: [process.env.KAFKA_TOPIC_OTP_EMAIL],
      fromBeginning: true,
    });

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

  const restartConsumer = async () => {
    console.log("Restarting consumer...");
    try {
      await consumer.stop();
      await startConsumer();
    } catch (error) {
      console.error("Error restarting consumer:", error);
      // Handle error
    }
  };

  consumer.on(consumer.events.CONNECT, async () => {
    console.log("Connected to Kafka");
  });

  consumer.on(consumer.events.DISCONNECT, async () => {
    console.log("Disconnected from Kafka");
    await restartConsumer();
  });

  consumer.on(consumer.events.STOP, async () => {
    console.log("Consumer stopped");
    await restartConsumer();
  });

  consumer.on(consumer.events.CRASH, async () => {
    console.log("Consumer crashed");
    await restartConsumer();
  });

  await startConsumer();
};
