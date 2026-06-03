// bot.js
const mineflayer = require('mineflayer');

const CONFIG = {
    host: 'botcreatortest.aternos.me', // СЮДА ТВОЙ АДРЕС
    username: 'DonateBot',          // НИК БОТА
    auth: 'offline'
};

function createBot() {
    const bot = mineflayer.createBot(CONFIG);

    bot.once('spawn', () => {
        console.log(`✅ Бот ${CONFIG.username} зашёл на сервер!`);
        // ЗАПОМИНАЕМ БОТА, ЧТОБЫ ДРУГИЕ ФАЙЛЫ МОГЛИ С НИМ РАБОТАТЬ
        global.bot = bot;
        bot.chat('Я бот для выдачи доната. Активирован!');
    });

    bot.on('error', (err) => console.error(`❌ Ошибка бота: ${err.message}`));
    bot.on('end', () => {
        console.log('🔴 Бот отключился, переподключение через 10 сек...');
        setTimeout(createBot, 10000);
    });
}

createBot();
