# OTP Email Bot 🤖

The OTP Email Bot is used to receive Kafka messages containing OTP information that has been sent via email, in order to use a Telegram bot to send notifications in a group. 🚀

## Features 🌟

## Getting Started 🏁

### Prerequisites

- Node.js 📦
- Kafka broker 🗃️
- A Telegram bot token (create one through BotFather in Telegram) 🤖

### Installation

1. Clone the repository:  
```bash
git clone https://github.com/dongtranthien/otp-email-bot.git
```

2. Install the dependencies:  
```bash
cd otp-email-bot
npm install
```

3. Copy the `.env.sample` and `config.json.sample` files to `.env` and `config.json` respectively and update them with your actual configuration details.

4. Start the bot:  
```
node app.js
```

### Docker Deployment 🐳

Build and run the Docker container using:  
```
docker build -t otp-email-bot .
docker run -d --name otp-email-bot --env-file .env otp-email-bot
```

### Configuration ⚙️

Edit `config.json` to include your database connection details and Telegram group ID. Refer to `config.json.sample` for the sample configuration.

### Environment Variables

- `TELEGRAM_GROUP_ID`: Your Telegram group or channel ID where notifications will be sent. 📨

## Usage 📘

Once the bot is running, it will start monitoring the specified databases for changes and send notifications to the configured Telegram group or channel.

## Contributing 🤝

Contributions are welcome! Please feel free to submit a pull request.

## License 📄

This project is licensed under the MIT License - see the LICENSE.md file for details.
