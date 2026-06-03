const express = require('express');
const fetch = require('node-fetch');
const mineflayer = require('mineflayer');

// ========== 1. ВЕБ-СЕРВЕР (САЙТ) ==========
const app = express();
app.use(express.json());
app.use(express.static('.'));

app.get('/api/status', async (req, res) => {
    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/botcreatortest.aternos.me:23209`);
        const data = await response.json();
        res.json({
            online: data.online,
            players: data.players?.online || 0,
            maxPlayers: data.players?.max || 0,
            version: data.version || '1.20.1'
        });
    } catch (err) {
        res.json({ online: false });
    }
});

app.post('/api/buy', (req, res) => {
    const { nick, privilege } = req.body;
    console.log(`🛒 Запрос: ${nick} хочет ${privilege}`);
    res.json({ success: true, message: 'Заявка принята. Ожидайте выдачи.' });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Сайт: http://localhost:${PORT}`));

// ========== 2. БОТ ДЛЯ ВЫДАЧИ ПРИВИЛЕГИЙ ==========
const CONFIG = {
    host: 'botcreatortest.aternos.me',
    username: 'DonateBot',
    version: '1.20.1',
    auth: 'offline'
};

function createBot() {
    console.log(`🟡 Бот ${CONFIG.username} подключается...`);
    const bot = mineflayer.createBot(CONFIG);

    bot.once('spawn', () => {
        console.log(`✅ Бот ${CONFIG.username} зашёл на сервер!`);
        bot.chat('Бот активен. Для выдачи используйте: /lp user Игрок parent set привилегия');
    });

    bot.on('chat', (username, message) => {
        if (username === CONFIG.username) return;

        // Проверяем команду /lp user ... parent set ...
        if (message.startsWith('/lp user ') && message.includes(' parent set ')) {
            console.log(`🎁 Обнаружена команда выдачи от ${username}: ${message}`);
            bot.chat(message); // просто дублируем команду от имени бота (бот с OP выполнит)
        }
    });

    bot.on('error', (err) => console.error(`❌ Ошибка бота: ${err.message}`));
    bot.on('end', () => {
        console.log('🔴 Бот отключился, переподключение через 10 сек...');
        setTimeout(createBot, 10000);
    });
}

createBot();
