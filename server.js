const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Настройки
const CONFIG = {
    minecraft: {
        host: 'botcreatortest.aternos.me',
        port: 23209
    },
    currency: {
        name: 'GM',
        startBalance: 50000
    }
};

// Балансы (пока в памяти)
let balances = {};

function getBalance(nick) { return balances[nick] ?? CONFIG.currency.startBalance; }
function setBalance(nick, amount) { balances[nick] = Math.max(0, amount); }

// Привилегии
const privileges = {
    'premium':   { price: 1000, name: '⭐ Премиум' },
    'creative':  { price: 2500, name: '🎨 Креатив' },
    'moder':     { price: 5000, name: '🛡️ Модер' },
    'admin':     { price: 10000, name: '👑 Админ' },
    'headadmin': { price: 20000, name: '🔱 Гл. Админ' },
    'caesar':    { price: 50000, name: '🏛️ Цезарь' },
    'ruler':     { price: 100000, name: '👑 ПРАВИТЕЛЬ' }
};

// API: статус сервера
app.get('/api/status', async (req, res) => {
    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${CONFIG.minecraft.host}:${CONFIG.minecraft.port}`);
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

// API: покупка
app.post('/api/buy', (req, res) => {
    const { nick, privilege } = req.body;
    if (!nick || !privilege || !privileges[privilege]) {
        return res.json({ success: false, message: 'Неверные данные' });
    }
    const balance = getBalance(nick);
    const price = privileges[privilege].price;
    if (balance < price) {
        return res.json({ success: false, message: `Не хватает GM. Нужно: ${price}` });
    }
    setBalance(nick, balance - price);
    // TODO: вызвать бота для выдачи привилегии (через RCON или mineflayer)
    console.log(`🎁 Выдана ${privileges[privilege].name} игроку ${nick}. Остаток: ${getBalance(nick)} GM`);
    res.json({ success: true, message: `${privileges[privilege].name} выдана! Остаток: ${getBalance(nick)} GM` });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ API и сайт запущены на порту ${PORT}`));
