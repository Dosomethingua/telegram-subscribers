const TelegramBot = require('node-telegram-bot-api');
const { Client } = require('@notionhq/client');
require('dotenv').config();

// Ініціалізація Telegram Bot і Notion
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: false });
const notion = new Client({ auth: NOTION_API_KEY });

// Масив каналів для перевірки кількості підписників
const CHANNELS = [
  { name: 'Tiny Verse', link: '@tverseofficialchannel' },
  { name: 'Harvest Moon', link: '@nearharvestmoon' },
  { name: 'Hot', link: '@hotonnear' },
  { name: 'Pocket Rocket Game', link: '@pocket_rocket_game' },
  { name: 'PAWS', link: '@pawsupfam' },
  { name: 'Bums', link: '@bums_official' },
  { name: 'Drops', link: '@EtherDrops_News' },
  { name: 'Cats&Dogs', link: '@catsdogs_community' },
  { name: 'OKX Racer', link: '@okx_racer_official_announcement' },
  { name: 'Telegram Apps Center', link: '@trendingapps' },
  { name: 'Blink', link: '@blink_en' },
  { name: 'Gomble (EggDrop)', link: '@officialgomble' },
  { name: 'Coub', link: '@coubnews' },
  { name: '#Memhash', link: '@memhash' },
  { name: 'Not Pixel', link: '@notpixel_channel' },
  { name: 'True', link: '@trueworld' },
];

// Функція для отримання кількості підписників каналу
async function getSubscribersCount(channel) {
  const count = await bot.getChatMembersCount(channel.link);
  return count;
}

// Функція для оновлення даних у Notion
async function updateNotionSubscribers() {
  try {
    for (const channel of CHANNELS) {
      const count = await getSubscribersCount(channel);
      console.log(`Кількість підписників каналу ${channel.name}: ${count}`);

      // Оновлення значення в Notion
      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: channel.name } }],
          },
          'TG Sub': {
            number: count,
          },
        },
      });
    }
    console.log('Дані успішно оновлено в Notion!');
  } catch (error) {
    console.error('Помилка при оновленні даних:', error.message);
  }
}

// Запуск основного процесу
updateNotionSubscribers();
