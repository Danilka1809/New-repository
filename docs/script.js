// ========== СТАТУС СЕРВЕРА ==========
async function updateServerStatus() {
    try {
        const response = await fetch('https://api.mcsrvstat.us/2/botcreatortest.aternos.me:23209');
        const data = await response.json();
        
        document.getElementById('serverOnline').innerHTML = data.online ? '✅ Онлайн' : '❌ Офлайн';
        document.getElementById('serverPlayers').innerHTML = data.online ? `${data.players?.online || 0}/${data.players?.max || 0}` : '—';
        document.getElementById('serverVersion').innerHTML = data.version || '—';
        
        const badge = document.getElementById('statusBadge');
        if (badge) badge.innerHTML = data.online ? '⚡ Сервер онлайн' : '💤 Сервер офлайн';
    } catch (err) {
        console.error('Ошибка статуса:', err);
    }
}

updateServerStatus();
setInterval(updateServerStatus, 30000);

// ========== ДАННЫЕ О ПРИВИЛЕГИЯХ ==========
const privileges = {
    'premium':   { price: 1000, name: '⭐ Премиум', desc: 'Базовый донат-пакет', color: '#eab308' },
    'creative':  { price: 2500, name: '🎨 Креатив', desc: 'Режим творчества', color: '#10b981' },
    'moder':     { price: 5000, name: '🛡️ Модер', desc: 'Присмотр за порядком', color: '#3b82f6' },
    'admin':     { price: 10000, name: '👑 Админ', desc: 'Полный контроль', color: '#ef4444' },
    'headadmin': { price: 20000, name: '🔱 Гл. Админ', desc: 'Управление сервером', color: '#a855f7' },
    'caesar':    { price: 50000, name: '🏛️ Цезарь', desc: 'Императорская власть', color: '#d946ef' },
    'ruler':     { price: 100000, name: '👑 ПРАВИТЕЛЬ', desc: 'Абсолютная власть', color: '#fbbf24' }
};

// ========== РИСУЕМ КАРТОЧКИ ТОВАРОВ ==========
const grid = document.getElementById('storeGrid');
if (grid) {
    for (const [key, p] of Object.entries(privileges)) {
        grid.innerHTML += `
            <div class="card" style="border-left: 6px solid ${p.color}">
                <h3>${p.name}</h3>
                <div class="price">💰 ${p.price} GM</div>
                <div class="desc">${p.desc}</div>
                <div class="buy-area">
                    <input type="text" id="nick_${key}" class="nick-input" placeholder="Ваш никнейм">
                    <button class="buy-btn" onclick="buy('${key}')">🎁 Купить</button>
                </div>
            </div>
        `;
    }
}

// ========== ФУНКЦИЯ ПОКУПКИ (ПРЯМАЯ СВЯЗЬ С БОТОМ) ==========
async function buy(privilegeKey) {
    // 1. Берем ник из поля ввода
    const nickInput = document.getElementById(`nick_${privilegeKey}`);
    const nickname = nickInput.value.trim();
    
    if (!nickname) {
        showToast('❌ Введи свой никнейм!', '#ef4444');
        return;
    }
    
    const privName = privileges[privilegeKey].name;
    const privPrice = privileges[privilegeKey].price;
    
    showToast('⏳ Отправляю запрос боту...', '#3b82f6');
    
    try {
        // 2. Отправляем запрос на API, который поднят в server.js
        const response = await fetch('/api/grant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nick: nickname, 
                priv: privilegeKey,
                price: privPrice
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`✅ ${privName} выдана игроку ${nickname}!`, '#22c55e');
            // Очищаем поле ввода после успешной покупки
            nickInput.value = '';
        } else {
            showToast(`❌ Ошибка: ${data.message}`, '#ef4444');
        }
    } catch (err) {
        console.error('Ошибка при покупке:', err);
        showToast('❌ Не удалось связаться с ботом. Убедись, что Actions запущен.', '#ef4444');
    }
}

// ========== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ УВЕДОМЛЕНИЙ ==========
function showToast(msg, color) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.style.backgroundColor = color;
    toast.innerText = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
}
