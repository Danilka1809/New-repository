// ========== КОНФИГУРАЦИЯ ==========
const CONFIG = {
    emailWebhook: 'https://api.web3forms.com/submit',
    emailKey: '483fce89-6fa4-4704-bc74-1dac5cfcf0d0',
    emailTo: 'ramonenok@bk.ru',
    serverHost: 'botcreatortest.aternos.me',
    serverPort: 23209,
    currencyName: 'GM',
    startBalance: 50000
};

// ========== ПРИВИЛЕГИИ ==========
const privileges = {
    'creative':  { price: 1000, name: '🎨 Креатив', color: '#10b981', sortOrder: 1 },
    'moder':     { price: 2500, name: '🛡️ Модер', color: '#3b82f6', sortOrder: 2 },
    'lord':      { price: 5000, name: '⚔️ Лорд', color: '#8b5cf6', sortOrder: 3 },
    'admin':     { price: 10000, name: '👑 Админ', color: '#ef4444', sortOrder: 4 },
    'headadmin': { price: 20000, name: '🔱 Гл. Админ', color: '#a855f7', sortOrder: 5 },
    'creator':   { price: 30000, name: '✨ Создатель', color: '#06b6d4', sortOrder: 6 },
    'founder':   { price: 40000, name: '🔥 Основатель', color: '#f97316', sortOrder: 7 },
    'owner':     { price: 50000, name: '💎 Владелец', color: '#ec4899', sortOrder: 8 },
    'console':   { price: 60000, name: '🖥️ Консоль', color: '#64748b', sortOrder: 9 },
    'caesar':    { price: 70000, name: '🏛️ Цезарь', color: '#d946ef', sortOrder: 10 },
    'server':    { price: 80000, name: '🌐 Сервер', color: '#0ea5e9', sortOrder: 11 },
    'helper':    { price: 90000, name: '🤝 Хелпер', color: '#14b8a6', sortOrder: 12 },
    'hype':      { price: 100000, name: '🔥 HYPE', color: '#f43f5e', sortOrder: 13 },
    'staff':     { price: 110000, name: '⭐ STAFF', color: '#6366f1', sortOrder: 14 },
    'ruler':     { price: 120000, name: '👑 ПРАВИТЕЛЬ', color: '#fbbf24', sortOrder: 15 }
};

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentServer = 'survival';
let currentBalance = CONFIG.startBalance;
let pendingPurchase = null;

// ========== БАЛАНС ==========
function loadBalance() {
    const saved = localStorage.getItem('grifBalance');
    if (saved) currentBalance = parseInt(saved);
    updateBalanceDisplay();
}

function saveBalance() {
    localStorage.setItem('grifBalance', currentBalance);
}

function updateBalanceDisplay() {
    const balanceEl = document.getElementById('userBalance');
    if (balanceEl) balanceEl.innerText = currentBalance.toLocaleString();
}

function topUpBalance() {
    const amount = prompt('💎 Введите сумму пополнения GM:', '1000');
    if (amount && !isNaN(amount)) {
        currentBalance += parseInt(amount);
        saveBalance();
        updateBalanceDisplay();
        showToast(`✅ Баланс пополнен на ${amount} GM!`, '#22c55e');
    }
}

// ========== СТАТУС СЕРВЕРА ==========
async function updateServerStatus() {
    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${CONFIG.serverHost}:${CONFIG.serverPort}`);
        const data = await response.json();
        document.getElementById('serverOnline').innerHTML = data.online ? '✅ Онлайн' : '❌ Офлайн';
        document.getElementById('serverPlayers').innerHTML = data.online ? `${data.players?.online || 0}/${data.players?.max || 0}` : '—';
        document.getElementById('serverVersion').innerHTML = data.version || '—';
        const badge = document.getElementById('statusBadge');
        if (badge) {
            const statusText = badge.querySelector('#statusText');
            if (statusText) statusText.innerText = data.online ? 'Сервер онлайн' : 'Сервер офлайн';
        }
    } catch (err) {
        console.error('Ошибка статуса:', err);
    }
}

// ========== ОТПРАВКА НА ПОЧТУ ==========
async function sendEmailNotification(nickname, privilegeName, price, server) {
    const formData = new FormData();
    formData.append('access_key', CONFIG.emailKey);
    formData.append('email', CONFIG.emailTo);
    formData.append('subject', `🛒 Покупка доната на GrifLauncher`);
    formData.append('from_name', 'GrifLauncher Store');
    formData.append('message', `
        Новая покупка!
        
        Игрок: ${nickname}
        Привилегия: ${privilegeName}
        Сумма: ${price} GM
        Сервер: ${server}
        
        Время: ${new Date().toLocaleString()}
        
        Выдать донат в течение 10 минут!
    `);
    formData.append('_captcha', 'false');

    try {
        const response = await fetch(CONFIG.emailWebhook, { method: 'POST', body: formData });
        const result = await response.json();
        console.log('Почта отправлена:', result);
        return result.success === true;
    } catch (err) {
        console.error('Ошибка отправки почты:', err);
        return false;
    }
}

// ========== ОТПРАВКА КОМАНДЫ БОТУ ==========
async function sendToBot(nickname, privilegeKey, price) {
    try {
        const response = await fetch('/api/grant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nick: nickname, priv: privilegeKey, price: price, server: currentServer })
        });
        return await response.json();
    } catch (err) {
        console.error('Ошибка отправки боту:', err);
        return { success: false, message: 'Бот не в сети' };
    }
}

// ========== ПОКУПКА (ШАГ 1) ==========
function startPurchase(privilegeKey) {
    const nickInput = document.getElementById(`nick_${privilegeKey}`);
    const nickname = nickInput.value.trim();
    
    if (!nickname) {
        showToast('❌ Введи свой никнейм!', '#ef4444');
        return;
    }
    
    const priv = privileges[privilegeKey];
    if (currentBalance < priv.price) {
        showToast(`❌ Не хватает GM! Нужно: ${priv.price} GM`, '#ef4444');
        return;
    }
    
    pendingPurchase = {
        privilegeKey,
        nickname,
        privName: priv.name,
        price: priv.price
    };
    
    document.getElementById('modalPrivName').innerText = priv.name;
    document.getElementById('modalPrice').innerText = priv.price;
    document.getElementById('modalNick').innerText = nickname;
    document.getElementById('modalServer').innerText = 
        currentServer === 'survival' ? 'Выживание #1' : 
        currentServer === 'creative' ? 'Креатив' : 'Анархия';
    
    document.getElementById('buyModal').style.display = 'flex';
}

// ========== ПОКУПКА (ШАГ 2 - ПОДТВЕРЖДЕНИЕ) ==========
async function confirmPurchase() {
    if (!pendingPurchase) return;
    
    const { privilegeKey, nickname, privName, price } = pendingPurchase;
    
    closeModal();
    showToast('⏳ Обработка покупки...', '#3b82f6');
    
    // Списываем баланс
    currentBalance -= price;
    saveBalance();
    updateBalanceDisplay();
    
    // Отправляем уведомление на почту
    const serverName = currentServer === 'survival' ? 'Выживание #1' : 
                       currentServer === 'creative' ? 'Креатив' : 'Анархия';
    
    await sendEmailNotification(nickname, privName, price, serverName);
    
    // Отправляем команду боту
    const result = await sendToBot(nickname, privilegeKey, price);
    
    if (result.success) {
        showToast(`✅ ${privName} выдана! Проверьте привилегии в игре.`, '#22c55e');
        showToast('⏰ Донат придёт в течение 10 минут', '#f59e0b');
    } else {
        showToast(`⚠️ ${result.message || 'Запрос отправлен, ожидайте выдачи'}`, '#f59e0b');
    }
    
    // Очищаем поле ввода
    const nickInput = document.getElementById(`nick_${privilegeKey}`);
    if (nickInput) nickInput.value = '';
    
    pendingPurchase = null;
}

function closeModal() {
    document.getElementById('buyModal').style.display = 'none';
    pendingPurchase = null;
}

// ========== ВЫБОР СЕРВЕРА ==========
function initServerSelector() {
    const buttons = document.querySelectorAll('.server-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentServer = btn.dataset.server;
            showToast(`🎮 Выбран сервер: ${btn.innerText}`, '#3b82f6');
        });
    });
}

// ========== РЕНДЕР МАГАЗИНА ==========
function renderStore() {
    const grid = document.getElementById('storeGrid');
    if (!grid) return;
    
    const sorted = Object.entries(privileges).sort((a, b) => a[1].sortOrder - b[1].sortOrder);
    
    grid.innerHTML = '';
    for (const [key, p] of sorted) {
        grid.innerHTML += `
            <div class="card" style="border-left: 6px solid ${p.color}">
                <h3>${p.name}</h3>
                <div class="price">💰 ${p.price.toLocaleString()} GM</div>
                <div class="desc">Привилегия даёт доступ к особым возможностям на сервере</div>
                <input type="text" id="nick_${key}" class="nick-input" placeholder="Ваш никнейм">
                <button class="buy-btn" onclick="startPurchase('${key}')">🎁 Купить</button>
            </div>
        `;
    }
}

// ========== УВЕДОМЛЕНИЯ ==========
function showToast(msg, color) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.style.backgroundColor = color;
    toast.innerText = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', () => {
    loadBalance();
    renderStore();
    initServerSelector();
    updateServerStatus();
    setInterval(updateServerStatus, 30000);
    
    window.topUpBalance = topUpBalance;
    window.startPurchase = startPurchase;
    window.confirmPurchase = confirmPurchase;
    window.closeModal = closeModal;
});
