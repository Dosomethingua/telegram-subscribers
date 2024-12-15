const TelegramBot = require('node-telegram-bot-api');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Telegram бот
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Notion клієнт
const notion = new Client({ auth: NOTION_API_KEY });

// Список каналів і їх відповідних імен у Notion
const CHANNELS = [
  { name: 'Tiny Verse', channelId: '@true_ecosystem' },
  { name: 'Harvest Moon', channelId: '@starsmajor' },
  { name: 'Hot', channelId: '@examplechannel' },
];

// Отримання кількості підписників
async function getSubscribersCount(channelId) {
  try {
    const chat = await bot.getChat(channelId);
    return chat.members_count || 0; // Отримання кількості підписників
  } catch (error) {
    console.error(`Error fetching count for ${channelId}:`, error.message);
    return 0;
  }
}

// Оновлення даних у Notion
async function updateNotionSubscribers() {
  for (const channel of CHANNELS) {
    const count = await getSubscribersCount(channel.channelId);
    console.log(`Кількість підписників ${channel.name}: ${count}`);

    // Оновлення даних у таблиці Notion
    await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        property: 'Name',
        title: { equals: channel.name },
      },
    }).then(async (response) => {
      const pageId = response.results[0]?.id;
      if (pageId) {
        await notion.pages.update({
          page_id: pageId,
          properties: {
            "TG Sub": {
              number: count,
            },
          },
        });
        console.log(`Оновлено ${channel.name} з ${count} підписниками`);
      } else {
        console.log(`Сторінка ${channel.name} не знайдена.`);
      }
    });
  }
}

updateNotionSubscribers();
