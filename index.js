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
  { name: "Hot", link: "@hotonnear", pageId: "135c9b1febab80f88539e4b76c1a76b9" },
  { name: "Pocket Rocket Game", link: "@pocket_rocket_game", pageId: "142c9b1febab8000aa95c97f380ffee0" },
  { name: "PAWS", link: "@pawsupfam", pageId: "135c9b1febab805c854ccfcbc6cd19c0" },
  { name: "Bums", link: "@bums_official", pageId: "14ac9b1febab802a93a7d8b8dab0cff9" },
  { name: "Drops", link: "@EtherDrops_News", pageId: "11cc9b1febab806e891edd9f5c4629cf" },
  { name: "Cats&Dogs", link: "@catsdogs_community", pageId: "11cc9b1febab80cc8fa9d664ec63d51e" },
  { name: "OKX Racer", link: "@okx_racer_official_announcement", pageId: "11cc9b1febab8073be0cceae8d0dbed9" },
  { name: "Telegram Apps Center", link: "@trendingapps", pageId: "14bc9b1febab805db3c8fe742df2d417" },
  { name: "Blink", link: "@blink_en", pageId: "13ac9b1febab80679bc4d3c4dc370b1f" },
  { name: "Gomble (EggDrop)", link: "@officialgomble", pageId: "00694fca2eea4101bfe26aad05c05a83" },
  { name: "Coub", link: "@coubnews", pageId: "11cc9b1febab805abc33c2fc7bae1496" },
  { name: "#Memhash", link: "@memhash", pageId: "14fc9b1febab80ceb8a0ed19a0b79f95" },
  { name: "Not Pixel", link: "@notpixel_channel", pageId: "11ac9b1febab80478ee2f251932a4067" },
  { name: "True", link: "@trueworld", pageId: "11ac9b1febab807a8271dd757e5fce27" },
];

// Функція для отримання кількості підписників каналу
async function getSubscribersCount(channel) {
  try {
    const membersCount = await bot.getChatMembersCount(channel.link);
    console.log(`Кількість підписників для ${channel.name}: ${membersCount}`);
    return membersCount;
  } catch (error) {
    console.error(`Помилка отримання підписників для ${channel.name}:`, error.message);
    return 0; // Повертаємо 0 у випадку помилки
  }
}

// Оновлення даних у Notion
async function updateNotionDatabase(channel, count) {
  try {
    await notion.pages.update({
      page_id: channel.pageId,
      properties: {
        tgsubs1: {
          number: count, // Оновлюємо правильну змінну
        },
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
