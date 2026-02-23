require('dotenv').config();
const { Telegraf } = require('telegraf');
const { ethers } = require('ethers');

// Ensure required environment variables are present
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error("Missing TELEGRAM_BOT_TOKEN in .env");
    process.exit(1);
}

if (!process.env.MONAD_RPC_URL) {
    console.error("Missing MONAD_RPC_URL in .env");
    process.exit(1);
}

if (!process.env.ESCROW_ADDRESS) {
    console.error("Missing ESCROW_ADDRESS in .env");
    process.exit(1);
}

// 1. Initialize Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Ideally, this would be a database table tracking users who opted into notifications.
// For the hackathon boilerplate, we'll store them in memory.
const subscribedChats = new Set();

bot.start((ctx) => {
    subscribedChats.add(ctx.chat.id);
    ctx.reply(
        "Welcome to MicroWork! 🚀\n\n" +
        "I will notify you instantly when a new micro-job is posted on the Monad Testnet."
    );
});

bot.command('stop', (ctx) => {
    subscribedChats.delete(ctx.chat.id);
    ctx.reply("You have been unsubscribed from new job notifications.");
});

// 2. Initialize Blockchain Listener
const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL);

// Minimal ABI just to listen to the JobCreated event
const escrowAbi = [
    "event JobCreated(uint256 indexed jobId, address indexed client, uint256 payment, string description)"
];

const escrowContract = new ethers.Contract(process.env.ESCROW_ADDRESS, escrowAbi, provider);

console.log(`Listening for new jobs on Escrow: ${process.env.ESCROW_ADDRESS}...`);

escrowContract.on("JobCreated", (jobId, client, payment, description, event) => {
    const paymentInMon = ethers.formatEther(payment);
    const message =
        `🚨 *New MicroWork Job Posted!* 🚨\n\n` +
        `*Job ID:* #${jobId}\n` +
        `*Client:* \`${client}\`\n` +
        `*Payout:* ${paymentInMon} MON 💸\n` +
        `*Description:* ${description}\n\n` +
        `👉 [Open Worker Dashboard](https://your-frontend-url.vercel.app/dashboard)`;

    console.log(`Sending notification for Job #${jobId}...`);

    for (const chatId of subscribedChats) {
        bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' })
            .catch(err => console.error(`Failed to send to ${chatId}:`, err));
    }
});

// Start the bot
bot.launch().then(() => {
    console.log("Telegraf Bot is running and waiting for subscribers...");
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
