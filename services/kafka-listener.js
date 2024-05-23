const { Kafka } = require("kafkajs");

exports.kafkaListener = async (telegramManager) => {
  const kafka = new Kafka({
    clientId: "otp-email-bot-client-" + Math.random().toString(36).substring(7),
    brokers: process.env.KAFKA_PRODUCER_BROKER_DB_CHANGE.split(","),
  });
  const consumer = kafka.consumer({
    groupId: "otp-email-bot-group",
    retry: {
      maxRetryTime: 1000000,
      retries: 50000,
      restartOnFailure: async (e) => {
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
  consumer.on(consumer.events.DISCONNECT, async (error) => {
    console.log(error, "Disconnected from kafka");
  });

  consumer.on(consumer.events.CRASH, async (event) => {
    console.error(`Consumer crashed: ${event.payload.error.message}`);
    console.error(`Crash type: ${event.payload.error.type}`);
    if (event.payload.error.message === "Failed to find group coordinator") {
      console.log("Restart consumer when crash message is Failed to find group coordinator");
      startConsumer();
    }
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
          let emailEscaped = email.replace(/\./g, "\\.");
          emailEscaped = emailEscaped.replace(/\-/g, "\\-");
          emailEscaped = emailEscaped.replace(/\_/g, "\\_");

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
