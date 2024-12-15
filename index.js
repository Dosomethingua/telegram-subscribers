const TelegramBot = require('node-telegram-bot-api');
const { Client } = require('@notionhq/client');
require('dotenv').config();

// Конфігурація токенів та ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Ініціалізація Telegram бота та Notion клієнта
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
const notion = new Client({ auth: NOTION_API_KEY });

// Список каналів
const channels = [
  { name: "Tiny Verse", link: "https://t.me/tverseofficialchannel" },
  { name: "Harvest Moon", link: "https://t.me/nearharvestmoon" },
  { name: "Hot", link: "https://t.me/hotonnear" },
  { name: "Pocket Rocket Game", link: "https://t.me/pocket_rocket_game" },
  { name: "PAWS", link: "https://t.me/pawsupfam" },
  { name: "Bums", link: "https://t.me/bums_official" },
  { name: "Drops", link: "https://t.me/EtherDrops_News" },
  { name: "Cats&Dogs", link: "https://t.me/catsdogs_community" },
  { name: "OKX Racer", link: "https://t.me/okx_racer_official_announcement" },
  { name: "Telegram Apps Center", link: "https://t.me/trendingapps" },
  { name: "Blink", link: "https://t.me/blink_en" },
  { name: "Gomble (EggDrop)", link: "https://t.me/officialgomble" },
  { name: "Coub", link: "https://t.me/coubnews" },
  { name: "#Memhash", link: "https://t.me/memhash" },
  { name: "Not Pixel", link: "https://t.me/notpixel_channel" },
  { name: "True", link: "https://t.me/trueworld" },
];

// Функція для отримання кількості підписників каналу
async function getSubscribersCount(channel) {
  try {
    const chat = await bot.getChat(channel.link);
    return chat.members_count;
  } catch (error) {
    console.error(`Помилка отримання підписників для ${channel.name}:`, error.message);
    return 0; // Повертаємо 0 у випадку помилки
  }
}

// Оновлення даних у Notion
async function updateNotionDatabase(channel, count) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: channel.name } }] },
        Subscribers: { number: count },
      },
    });
    console.log(`Дані для ${channel.name} оновлено: ${count} підписників.`);
  } catch (error) {
    console.error(`Помилка оновлення даних у Notion для ${channel.name}:`, error.message);
  }
}

// Основна функція
(async () => {
  console.log("Початок оновлення кількості підписників...");

  for (const channel of channels) {
    const count = await getSubscribersCount(channel);
    await updateNotionDatabase(channel, count);
  }

  console.log("Оновлення завершено!");
})();
