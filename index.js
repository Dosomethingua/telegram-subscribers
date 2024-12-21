/***************************************************************
 *          CODE: Telegram → Notion (TG Sub / Prev Sub)
 ***************************************************************/
const TelegramBot = require('node-telegram-bot-api');
const { Client } = require('@notionhq/client');
require('dotenv').config();

// ---------------------------------------------------
// 1. Зчитуємо ключі із .env або інших змінних середовища
// ---------------------------------------------------
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// ---------------------------------------------------
// 2. Ініціалізація Telegram бота та Notion клієнта
// ---------------------------------------------------
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
const notion = new Client({ auth: NOTION_API_KEY });

// ---------------------------------------------------
// 3. Список каналів із відповідними Page ID у Notion
// ---------------------------------------------------
const channels = [
  { name: "Monad", link: "@monad_xyz", pageId: "487a289ec87c4e418542842e01ab09d3" },
  { name: "Berachain", link: "@BerachainPortal", pageId: "8437c0bae0184de79d2aa922ceeea42a" },
  { name: "Mind Network", link: "@MindNetwork_xyz", pageId: "830453fc700c46e4bd25b4932bef9bba" },
  { name: "SYNTHR", link: "@synthrcommunitychannel", pageId: "8808d55371094a2a95731926d057736e" },
  { name: "Analog", link: "@analogtimer", pageId: "1bb4e7cb95ba45b2beee8389ac29afde" },
  { name: "ZetaChain", link: "@zetachainofficial", pageId: "87a516628ab84eafb9ae4371f97f70ce" },
  { name: "Gomble (EggDrop)", link: "@officialgomble", pageId: "00694fca2eea4101bfe26aad05c05a83" },
  { name: "NFPrompt", link: "@nfprompt", pageId: "30afa62186b44392bcbbb644a8f70b1a" },
  { name: "DIN", link: "@DINCommunity", pageId: "3cc56e9870444a35a681a66698ab7ebb" },
  { name: "SecWareX", link: "@GoPlusSecurity", pageId: "efe4b6a3d8444822a06a1e2a0ed6a9d4" },
  { name: "Rhino.fi", link: "@rhinofiannouncements", pageId: "f0d101f38d684a20a04b2d6a73c9ada5" },
  { name: "Drops", link: "@EtherDrops_News", pageId: "11cc9b1febab806e891edd9f5c4629cf" },
  { name: "Telegram Apps Center", link: "@trendingapps", pageId: "14bc9b1febab805db3c8fe742df2d417" },
  { name: "Hot", link: "@hotonnear", pageId: "135c9b1febab80f88539e4b76c1a76b9" },
  { name: "Coub", link: "@coubnews", pageId: "11cc9b1febab805abc33c2fc7bae1496" },
  { name: "PAWS", link: "@pawsupfam", pageId: "135c9b1febab805c854ccfcbc6cd19c0" },
  { name: "Cats&Dogs", link: "@catsdogs_community", pageId: "11cc9b1febab80cc8fa9d664ec63d51e" },
  { name: "Bums", link: "@bums_official", pageId: "14ac9b1febab802a93a7d8b8dab0cff9" },
  { name: "Pocket Rocket Game", link: "@pocket_rocket_game", pageId: "142c9b1febab8000aa95c97f380ffee0" },
  { name: "#Memhash", link: "@memhash", pageId: "14fc9b1febab80ceb8a0ed19a0b79f95" },
  { name: "Tiny Verse", link: "@tverseofficialchannel", pageId: "142c9b1febab803091caebd3f0d931ee" },
  { name: "Blink", link: "@blink_en", pageId: "13ac9b1febab80679bc4d3c4dc370b1f" },
  { name: "Harvest Moon", link: "@nearharvestmoon", pageId: "14ac9b1febab80468b0fdb3365903ef3" },
  { name: "OKX Racer", link: "@okx_racer_official_announcement", pageId: "11cc9b1febab8073be0cceae8d0dbed9" },
  { name: "True", link: "@trueworld", pageId: "11ac9b1febab807a8271dd757e5fce27" },
  { name: "Not Pixel", link: "@notpixel_channel", pageId: "11ac9b1febab80478ee2f251932a4067" },
  { name: "Supra", link: "@SupraOracles", pageId: "3e9d5a32e3c147a8a6f519b6df411c5e" },
  { name: "Tea", link: "@teaprotocol", pageId: "c703d7c4b94443d59351adc790d16229" },
  { name: "Major", link: "@starsmajor", pageId: "11cc9b1febab80979911fb99fed569ba" },
  { name: "CARV", link: "@carv_official_global", pageId: "61a812e52d154b329b5d47fc487656e2" },
  { name: "Wizzwoods", link: "@wizzwoods_game", pageId: "15ec9b1febab802aaf29dd75a9678e2e" },
  { name: "LayerGame", link: "@LayerGame_chat", pageId: "fe391159117f45baada34694da922ed3" }
];

// ---------------------------------------------------
// 4. Допоміжна функція для паузи (затримки)
// ---------------------------------------------------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------
// 5. Отримуємо поточну кількість підписників у каналі
//    (з ретраями при помилці "Too Many Requests (429)")
// ---------------------------------------------------
async function getSubscribersCount(channel, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const count = await bot.getChatMemberCount(channel.link);
      console.log(`Підписники для ${channel.name}: ${count}`);
      return count;
    } catch (error) {
      // Якщо перевищено ліміт запитів до Telegram
      if (
        error.response &&
        error.response.body &&
        error.response.body.parameters &&
        error.response.body.parameters.retry_after
      ) {
        const retryAfter = error.response.body.parameters.retry_after;
        console.error(
          `Помилка для ${channel.name}: Too Many Requests. ` +
          `Повторна спроба через ${retryAfter} секунд...`
        );
        await sleep(retryAfter * 1000);
      } else {
        console.error(`Помилка для ${channel.name}:`, error.message);
      }
    }
  }
  // Якщо після усіх спроб не вдалося отримати кількість
  console.error(`Не вдалося отримати підписників для ${channel.name} після ${attempts} спроб.`);
  return null;
}

// ---------------------------------------------------
// 6. Отримуємо (старе) значення з поля "TG Sub" у Notion
// ---------------------------------------------------
async function getCurrentTgSub(pageId) {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    // Читаємо поточне число з поля "TG Sub"
    return response.properties["TG Sub"]?.number || 0;
  } catch (error) {
    console.error(`Помилка зчитування "TG Sub" для сторінки ${pageId}:`, error.message);
    return 0;
  }
}

// ---------------------------------------------------
// 7. Функція для обчислення тренду
// ---------------------------------------------------
function determineTrend(newValue, oldValue) {
  if (newValue > oldValue) return "Up";
  if (newValue < oldValue) return "Down";
  return "neutral";
}

// ---------------------------------------------------
// 8. Оновлення даних у Notion
//    - Переносимо старе TG Sub → Previous TG Sub
//    - Записуємо нове в TG Sub
//    - Вираховуємо тренд (Grow/Down)
// ---------------------------------------------------
async function updateNotionPage(channel, newValue, oldValue) {
  const trend = determineTrend(newValue, oldValue);

  try {
    await notion.pages.update({
      page_id: channel.pageId,
      properties: {
        // 1. Старе значення з "TG Sub" → "Previous TG Sub"
        "Previous TG Sub": { number: oldValue },

        // 2. Нове значення → "TG Sub"
        "TG Sub": { number: newValue },

        // 3. Тренд
        "Grow/Down": { select: { name: trend } },
      },
    });
    console.log(`Оновлено ${channel.name}. Тренд: ${trend}`);
  } catch (error) {
    console.error(`Помилка оновлення Notion для ${channel.name}:`, error.message);
  }
}

// ---------------------------------------------------
// 9. Основний процес: обходимо всі канали, зчитуємо
//    нову кількість підписників, оновлюємо Notion
// ---------------------------------------------------
(async () => {
  console.log("Початок оновлення кількості підписників...");

  for (const channel of channels) {
    // 9.1. Отримуємо нову кількість підписників із Telegram
    const newCount = await getSubscribersCount(channel);
    if (newCount === null) {
      console.warn(`Пропускаємо оновлення для ${channel.name}, бо не вдалося отримати підписників.`);
      continue;
    }

    // 9.2. Зчитуємо поточний TG Sub (старий) із Notion
    const oldCount = await getCurrentTgSub(channel.pageId);

    // 9.3. Оновлюємо Notion: переносимо oldCount → "Previous TG Sub",
    //     записуємо newCount у "TG Sub", обчислюємо "Grow/Down".
    await updateNotionPage(channel, newCount, oldCount);
  }

  console.log("Оновлення завершено!");
})();
