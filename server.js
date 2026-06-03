// server.js
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// --- ГОВОРИМ САЙТУ, ГДЕ ЛЕЖАТ ФАЙЛЫ (docs) ---
app.use(express.static(path.join(__dirname, 'docs')));

// --- ЭТО И ЕСТЬ ПУЛЬТ ДЛЯ БОТА (API) ---
app.post('/api/grant', (req, res) => {
    const { nick, priv } = req.body;

    if (!nick || !priv) {
        return res.status(400).json({ success: false, message: 'Не хватает данных' });
    }

    console.log(`📢 Получен приказ: выдать игроку ${nick} привилегию ${priv}`);

    // ВОТ ТУТ МЫ ВЫЗЫВАЕМ ТВОЕГО БОТА
    if (global.bot && global.bot.chat) {
        global.bot.chat(`/lp user ${nick} parent set ${priv}`);
        res.json({ success: true, message: `✅ Приказ отдан!` });
    } else {
        res.status(500).json({ success: false, message: '❌ Бот не в сети' });
    }
});

// --- ЗАПУСК СЕРВЕРА ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🌐 Сайт и пульт доступны на порту ${PORT}`);
});
