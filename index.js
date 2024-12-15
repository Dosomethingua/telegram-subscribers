const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Масив з 30 каналами. Замініть @channel1, @channel2 ... @channel30 на реальні канали
const CHANNELS = [
  '@true_ecosystem',
  '@starsmajor',
];

const bot = new TelegramBot(BOT_TOKEN, {polling: false});

async function getSubscribersCount(chatId) {
  const count = await bot.getChatMembersCount(chatId);
  return count;
}

(async () => {
  try {
    for (const channel of CHANNELS) {
      const count = await getSubscribersCount(channel);
      console.log(`Кількість підписників каналу ${channel}: ${count}`);
    }
  } catch (error) {
    console.error('Помилка:', error);
  }
})();
