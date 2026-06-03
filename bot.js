const mineflayer = require('mineflayer');

// ===== НАСТРОЙКИ (МЕНЯЙ ТУТ) =====
const CONFIG = {
    // УКАЖИ СВОЙ ДОМЕН ATERNOS (пример: 'tvoi-server.aternos.me')
    host: 'ТВОЙ_СЕРВЕР.aternos.me',
    // ПОРТ МОЖЕШЬ НЕ УКАЗЫВАТЬ - БОТ САМ ПОДСТАВИТ ПРАВИЛЬНЫЙ!
    username: 'DonateBot',       // Ник бота
    version: '1.20.1',           // Версия Minecraft
    auth: 'offline'              // Режим (не меняй)
};
// ====================================

// Функция создания бота
function createBot() {
    console.log(`🟡 Бот ${CONFIG.username} пытается подключиться к ${CONFIG.host}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: CONFIG.username,
        version: CONFIG.version,
        auth: CONFIG.auth
    });

    // БОТ УСПЕШНО ЗАШЕЛ
    bot.once('spawn', () => {
        console.log(`✅ Бот ${CONFIG.username} зашел на сервер!`);
        bot.chat('Привет! Я бот для выдачи доната. Для выдачи используйте: /grant Игрок привилегия');
        // Бот может немного двигаться, чтобы не заснуть
        startWalking(bot);
    });

    // БОТ ВИДИТ КОМАНДУ В ЧАТЕ
    bot.on('chat', (username, message) => {
        if (username === CONFIG.username) return;
        
        if (message.startsWith('/grant')) {
            const parts = message.split(' ');
            const player = parts[1];
            const rank = parts[2];
            if (player && rank) {
                // Выдача привилегии через LuckPerms
                bot.chat(`/lp user ${player} parent set ${rank}`);
                bot.chat(`✅ Игроку ${player} выдана привилегия ${rank}`);
                console.log(`🎁 Выдал ${rank} игроку ${player}`);
            }
        }
    });

    // БОТ ВЫЛЕТЕЛ С ОШИБКОЙ — ПЕРЕПОДКЛЮЧАЕМСЯ
    bot.on('error', (err) => {
        console.error(`❌ Ошибка: ${err.message}`);
        console.log(`🔄 Переподключение через 15 секунд...`);
        setTimeout(createBot, 15000);
    });

    // БОТ ОТКЛЮЧИЛСЯ — ПЕРЕПОДКЛЮЧАЕМСЯ
    bot.on('end', (reason) => {
        console.log(`🔴 Бот отключился по причине: ${reason || 'неизвестно'}`);
        console.log(`🔄 Переподключение через 15 секунд...`);
        setTimeout(createBot, 15000);
    });
}

// Бот немного двигается, чтобы его не выкинуло за бездействие
function startWalking(bot) {
    let walking = false;
    setInterval(() => {
        if (!bot || !bot.entity) return;
        if (!walking) {
            walking = true;
            bot.setControlState('forward', true);
            setTimeout(() => {
                if (bot && bot.setControlState) bot.setControlState('forward', false);
                walking = false;
            }, 2000);
        }
    }, 30000);
}

// ЗАПУСКАЕМ БОТА
createBot();
