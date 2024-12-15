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
  { name: "Monad", link: "@monad_xyz", pageId: "487a289ec87c4e418542842e01ab09d3" },
  { name: "Berachain", link: "@BerachainPortal", pageId: "8437c0bae0184de79d2aa922ceeea42a" },
  { name: "Mind Network", link: "@MindNetwork_xyz", pageId: "830453fc700c46e4bd25b4932bef9bba" },
  { name: "SYNTHR", link: "@synthrcommunitychannel", pageId: "8808d55371094a2a95731926d057736e" },
  { name: "Analog", link: "@analogtimer", pageId: "1bb4e7cb95ba45b2beee8389ac29afde" },
  { name: "ZetaChain", link: "@zetachainofficial", pageId: "87a516628ab84eafb9ae4371f97f70ce" },
  { name: "NFPrompt", link: "@nfprompt", pageId: "30afa62186b44392bcbbb644a8f70b1a" },
  { name: "DIN", link: "@DINCommunity", pageId: "3cc56e9870444a35a681a66698ab7ebb" },
  { name: "SecWareX", link: "@GoPlusSecurity", pageId: "efe4b6a3d8444822a06a1e2a0ed6a9d4" },
  { name: "Rhino.fi", link: "@rhinofiannouncements", pageId: "f0d101f38d684a20a04b2d6a73c9ada5" },
  { name: "Supra", link: "@SupraOracles", pageId: "3e9d5a32e3c147a8a6f519b6df411c5e" },
  { name: "Tea", link: "@teaprotocol", pageId: "c703d7c4b94443d59351adc790d16229" },
  { name: "LayerGame", link: "@LayerGame_chat", pageId: "fe391159117f45baada34694da922ed3" },
  { name: "Orbiter Finance", link: "@orbiterORB", pageId: "2685a32ec78848c5a7513b792ca8b652" },
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


// Функція для отримання кількості підписників
async function getSubscribersCount(channel) {
  try {
    const count = await bot.getChatMemberCount(channel.link);
    console.log(`Підписники для ${channel.name}: ${count}`);
    return count;
  } catch (error) {
    console.error(`Помилка для ${channel.name}:`, error.message);
    return 0;
  }
}

// Отримання попереднього значення з Notion
async function getPreviousCount(pageId) {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response.properties["Previous TG Sub"]?.number || 0;
  } catch (error) {
    console.error(`Помилка отримання попереднього значення:`, error.message);
    return 0;
  }
}

// Логіка для визначення "Grow/Down"
function determineTrend(currentCount, previousCount) {
  if (currentCount > previousCount) return "Up";
  if (currentCount < previousCount) return "Down";
  return "neutral";
}

// Оновлення даних у Notion
async function updateNotionDatabase(channel, currentCount, previousCount) {
  const trend = determineTrend(currentCount, previousCount);

  try {
    await notion.pages.update({
      page_id: channel.pageId,
      properties: {
        "TG Sub": { number: currentCount },
        "Previous TG Sub": { number: previousCount },
        "Grow/Down": { select: { name: trend } },
      },
    });
    console.log(`Оновлено ${channel.name}: ${trend}`);
  } catch (error) {
    console.error(`Помилка оновлення Notion для ${channel.name}:`, error.message);
  }
}

// Основна функція
(async () => {
  console.log("Початок оновлення кількості підписників...");

  for (const channel of channels) {
    const currentCount = await getSubscribersCount(channel);
    const previousCount = await getPreviousCount(channel.pageId);

    await updateNotionDatabase(channel, currentCount, previousCount);
  }

  console.log("Оновлення завершено!");
})();
