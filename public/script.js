const API_BASE = window.location.origin; // для GitHub Pages — будет свой адрес, потом заменишь

// Данные о привилегиях (цены)
const privileges = {
    'premium':   { price: 1000, name: '⭐ Премиум', desc: 'Базовый донат-пакет', color: '#eab308' },
    'creative':  { price: 2500, name: '🎨 Креатив', desc: 'Режим творчества', color: '#10b981' },
    'moder':     { price: 5000, name: '🛡️ Модер', desc: 'Присмотр за порядком', color: '#3b82f6' },
    'admin':     { price: 10000, name: '👑 Админ', desc: 'Полный контроль', color: '#ef4444' },
    'headadmin': { price: 20000, name: '🔱 Гл. Админ', desc: 'Управление сервером', color: '#a855f7' },
    'caesar':    { price: 50000, name: '🏛️ Цезарь', desc: 'Императорская власть', color: '#d946ef' },
    'ruler':     { price: 100000, name: '👑 ПРАВИТЕЛЬ', desc: 'Абсолютная власть', color: '#fbbf24' }
};

// Рендер карточек
const grid = document.getElementById('storeGrid');
for (const [key, p] of Object.entries(privileges)) {
    grid.innerHTML += `
        <div class="card" style="border-left: 6px solid ${p.color}">
            <h3>${p.name}</h3>
            <div class="price">💰 ${p.price} GM</div>
            <div class="desc">${p.desc}</div>
            <input type="text" id="nick_${key}" class="nick-input" placeholder="Ваш ник">
            <button class="buy-btn" onclick="buy('${key}')">🎁 Купить</button>
        </div>
    `;
}

// Функция покупки
window.buy = async (privilegeKey) => {
    const nickInput = document.getElementById(`nick_${privilegeKey}`);
    const nickname = nickInput.value.trim();
    if (!nickname) {
        showToast('❌ Введи никнейм!', '#ef4444');
        return;
    }
    showToast('⏳ Отправка...', '#3b82f6');
    try {
        const res = await fetch(`${API_BASE}/api/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nick: nickname, privilege: privilegeKey })
        });
        const data = await res.json();
        showToast(data.message, data.success ? '#22c55e' : '#ef4444');
    } catch (err) {
        showToast('❌ Ошибка соединения с сервером', '#ef4444');
    }
};

function showToast(msg, color) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.style.backgroundColor = color;
    toast.innerText = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
}

// Статус сервера
async function updateStatus() {
    try {
        const res = await fetch(`${API_BASE}/api/status`);
        const data = await res.json();
        document.getElementById('serverOnline').innerHTML = data.online ? '✅ Онлайн' : '❌ Офлайн';
        document.getElementById('serverPlayers').innerHTML = data.online ? `${data.players}/${data.maxPlayers}` : '—';
        document.getElementById('serverVersion').innerHTML = data.version || '—';
        const badge = document.getElementById('statusBadge');
        if (badge) badge.innerHTML = data.online ? '⚡ Сервер онлайн' : '💤 Сервер офлайн';
    } catch (err) {
        console.error('Ошибка статуса:', err);
    }
}
updateStatus();
setInterval(updateStatus, 30000);
