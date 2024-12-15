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

// Список каналів з Page ID
const channels = [
  { name: "Tiny Verse", link: "@tverseofficialchannel", pageId: "142c9b1febab803091caebd3f0d931ee" },
  { name: "Harvest Moon", link: "@nearharvestmoon", pageId: "14ac9b1febab80468b0fdb3365903ef3" },
  // Додайте інші канали тут...
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
    const response = await notion.pages.update({
      page_id: channel.pageId,
      properties: {
        tgsubs1: {
          number: count, // ВАЖЛИВО! Використовуємо "number" для оновлення числового значення
        },
      },
    });
    console.log(`Дані для ${channel.name} оновлено: ${count} підписників.`);
  } catch (error) {
    console.error(
      `Помилка оновлення даних у Notion для ${channel.name}:`,
      error.message
    );
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
