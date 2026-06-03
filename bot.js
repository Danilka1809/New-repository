const mineflayer = require('mineflayer');
const express = require('express');

// ========== НАСТРОЙКИ (меняешь здесь) ==========
const CONFIG = {
    minecraft: {
        host: 'ТВОЙ_СЕРВЕР.aternos.me',  // IP Aternos сервера
        port: 25565,
        username: 'DonateBot',           // ник бота
        version: '1.20.1',               // версия Minecraft
        auth: 'offline'                  // для пиратки
    },
    web: {
        port: 3000
    }
};
// ==============================================

// ----- ПРАВИЛА ВЫДАЧИ (соответствие "привилегия с сайта" -> "команда") -----
const privileges = {
    'premium':   'lp user {player} parent set premium',
    'vip':       'lp user {player} parent set vip',
    'legend':    'lp user {player} parent set legend'
};
// -------------------------------------------------------------------------

let bot = null;
let connected = false;

// ----- 1. БОТ ЗАХОДИТ НА СЕРВЕР -----
function createBot() {
    bot = mineflayer.createBot({
        host: CONFIG.minecraft.host,
        port: CONFIG.minecraft.port,
        username: CONFIG.minecraft.username,
        version: CONFIG.minecraft.version,
        auth: CONFIG.minecraft.auth
    });

    bot.on('login', () => {
        console.log(`✅ Бот ${CONFIG.minecraft.username} зашёл на сервер!`);
        connected = true;
    });

    bot.on('error', (err) => console.error('❌ Ошибка бота:', err));
    bot.on('end', () => {
        console.log('🔴 Бот отключился. Переподключение...');
        connected = false;
        setTimeout(createBot, 5000);
    });
}

// ----- 2. ФУНКЦИЯ ВЫДАЧИ ПРИВИЛЕГИИ (через чат) -----
function grantPrivilege(playerName, privilegeKey) {
    if (!connected) {
        console.log('❌ Бот не в сети, не могу выдать привилегию');
        return false;
    }
    const commandTemplate = privileges[privilegeKey];
    if (!commandTemplate) {
        console.log(`❌ Неизвестная привилегия: ${privilegeKey}`);
        return false;
    }
    const fullCommand = commandTemplate.replace('{player}', playerName);
    bot.chat(fullCommand);
    console.log(`✅ Выдана привилегия ${privilegeKey} игроку ${playerName} (команда: ${fullCommand})`);
    return true;
}

// ----- 3. ВЕБ-САЙТ (для покупки) -----
const app = express();
app.use(express.json());
app.use(express.static('public'));  // если хочешь красивую страницу в отдельном файле

// Простой HTML-интерфейс прямо в коде
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Магазин привилегий</title>
            <style>
                body { background: #0b0e17; color: #eef2ff; font-family: sans-serif; text-align: center; padding: 2rem; }
                .card { background: #1e293b; border-radius: 24px; padding: 1.5rem; margin: 1rem auto; width: 300px; display: inline-block; }
                button { background: #3b82f6; border: none; padding: 10px 20px; border-radius: 40px; color: white; cursor: pointer; font-size: 1rem; }
                input { padding: 8px; border-radius: 20px; border: none; margin: 10px; width: 200px; }
            </style>
        </head>
        <body>
            <h1>🛒 Магазин привилегий</h1>
            <div>
                <div class="card">
                    <h2>⭐ PREMIUM</h2>
                    <p>Цена: 100 монет</p>
                    <input type="text" id="nickname_premium" placeholder="Ваш ник">
                    <br>
                    <button onclick="buyPrivilege('premium')">Купить Premium</button>
                </div>
                <div class="card">
                    <h2>✨ VIP</h2>
                    <p>Цена: 200 монет</p>
                    <input type="text" id="nickname_vip" placeholder="Ваш ник">
                    <br>
                    <button onclick="buyPrivilege('vip')">Купить VIP</button>
                </div>
                <div class="card">
                    <h2>👑 LEGEND</h2>
                    <p>Цена: 500 монет</p>
                    <input type="text" id="nickname_legend" placeholder="Ваш ник">
                    <br>
                    <button onclick="buyPrivilege('legend')">Купить Legend</button>
                </div>
            </div>
            <p id="message"></p>
            <script>
                async function buyPrivilege(priv) {
                    let nickInput = document.getElementById('nickname_' + priv);
                    let nickname = nickInput.value.trim();
                    if (!nickname) {
                        alert('Введите никнейм');
                        return;
                    }
                    let response = await fetch('/buy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ privilege: priv, player: nickname })
                    });
                    let data = await response.json();
                    document.getElementById('message').innerText = data.message;
                }
            </script>
        </body>
        </html>
    `);
});

// API для покупки (проверка баланса не реализована, просто выдача)
app.post('/buy', (req, res) => {
    const { privilege, player } = req.body;
    if (!privilege || !player) {
        return res.json({ message: 'Не указана привилегия или ник' });
    }
    // ✅ ВМЕСТО ПРОВЕРКИ БАЛАНСА – СРАЗУ ВЫДАЁМ
    const success = grantPrivilege(player, privilege);
    if (success) {
        res.json({ message: `✅ Привилегия ${privilege} выдана игроку ${player}!` });
    } else {
        res.json({ message: `❌ Не удалось выдать привилегию. Бот не в сети или команда не найдена.` });
    }
});

// ----- 4. ЗАПУСК -----
createBot();
app.listen(CONFIG.web.port, () => {
    console.log(`🌐 Сайт магазина доступен: http://localhost:${CONFIG.web.port}`);
});
