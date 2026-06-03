// ========== FIREBASE ==========
const firebaseConfig = {
    apiKey: "AIzaSyCDHaYgSlhr-fvv8kPysZtfMWsXLHIfh48",
    authDomain: "griflaunc.firebaseapp.com",
    projectId: "griflaunc",
    storageBucket: "griflaunc.firebasestorage.app",
    messagingSenderId: "946120100074",
    appId: "1:946120100074:web:b672de237e7101b5a9ef93"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let products = [
    { id: 'vip', name: '👑 VIP Стандарт', price: 150, days: '10 дней', features: ['Цветной ник', '/kit', '/fly'] },
    { id: 'vip_plus', name: '💎 VIP+ Продвинутый', price: 350, days: '30 дней', features: ['Всё из VIP', 'VIP-чат', '/heal'] },
    { id: 'mvp', name: '⭐ MVP Вечный', price: 1000, days: 'Навсегда', features: ['Всё из VIP+', 'Префикс [KING]', '/god'] }
];

// Обновление UI после авторизации
function updateAuthUI() {
    const authDiv = document.getElementById('authStatus');
    if (authDiv) {
        if (currentUser) {
            authDiv.innerHTML = `<span>👤 ${currentUser.email}</span>`;
        } else {
            authDiv.innerHTML = `<span>👤 Не авторизован</span>`;
        }
    }
}

// Показ уведомлений
function showMessage(msg) {
    alert(msg);
}

// Загрузка магазина
function loadShop() {
    const container = document.getElementById('shopGrid');
    if (!container) return;
    let html = '';
    products.forEach(p => {
        html += `<div class="product-card"><h3>${p.name}</h3><div class="price">${p.price} ₽</div><div>${p.days}</div><ul>${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul><button class="buy-btn" onclick="buyProduct('${p.id}', ${p.price})">Купить</button></div>`;
    });
    container.innerHTML = html;
}

// Покупка (сохраняем в Firebase)
window.buyProduct = async (productId, price) => {
    if (!currentUser) { alert('Сначала войдите в аккаунт'); return; }
    await db.collection('orders').add({
        userId: currentUser.uid,
        productId: productId,
        price: price,
        date: new Date().toISOString(),
        status: 'Активен'
    });
    alert(`Заказ на ${price} ₽ оформлен! После оплаты привилегия придёт автоматически.`);
};

// Загрузка профиля
async function loadProfile() {
    const container = document.getElementById('profileCard');
    if (!container) return;
    if (!currentUser) {
        container.innerHTML = '<p>Войдите, чтобы увидеть профиль</p>';
        return;
    }
    container.innerHTML = `<h2>${currentUser.email}</h2><p>Дата регистрации: ${currentUser.metadata.creationTime}</p>`;
}

// Загрузка истории покупок
async function loadOrders() {
    const container = document.getElementById('tabContent');
    if (!container) return;
    if (!currentUser) { container.innerHTML = '<p>Войдите, чтобы увидеть историю</p>'; return; }
    const snapshot = await db.collection('orders').where('userId', '==', currentUser.uid).get();
    let html = '<div class="orders-list">';
    snapshot.forEach(doc => {
        let order = doc.data();
        html += `<div class="order-item">${order.productId} - ${order.price} ₽ - ${order.status}</div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Чат
async function loadMessages() {
    const container = document.getElementById('messages');
    if (!container) return;
    const snapshot = await db.collection('globalChat').orderBy('timestamp').limit(50).get();
    let html = '';
    snapshot.forEach(doc => {
        let msg = doc.data();
        html += `<div class="message"><b>${msg.userEmail}:</b> ${msg.text}<br><small>${new Date(msg.timestamp).toLocaleTimeString()}</small></div>`;
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input || !currentUser) return;
    if (input.value.trim()) {
        await db.collection('globalChat').add({
            userEmail: currentUser.email,
            text: input.value,
            timestamp: Date.now()
        });
        input.value = '';
        loadMessages();
    }
}

// Загрузка ленты
async function loadFeed() {
    const container = document.getElementById('feedList');
    if (!container) return;
    const snapshot = await db.collection('feed').orderBy('timestamp', 'desc').limit(10).get();
    let html = '';
    snapshot.forEach(doc => {
        let item = doc.data();
        html += `<div class="feed-item"><div><b>${item.user}</b><div class="feed-text">${item.text}</div><div class="feed-time">${new Date(item.timestamp).toLocaleString()}</div></div></div>`;
    });
    container.innerHTML = html;
}

// Рекомендации
function loadRecommended() {
    const container = document.getElementById('recommended');
    if (!container) return;
    container.innerHTML = `<div class="product-mini"><div><b>VIP Стандарт</b><div>150 ₽ / 10 дней</div></div><button class="buy-mini" onclick="buyProduct('vip',150)">Купить</button></div>
                          <div class="product-mini"><div><b>MVP Вечный</b><div>1000 ₽ / Навсегда</div></div><button class="buy-mini" onclick="buyProduct('mvp',1000)">Купить</button></div>`;
}

// Друзья онлайн
function loadOnlineFriends() {
    const container = document.getElementById('onlineFriends');
    if (!container) return;
    container.innerHTML = `<div class="friend-item"><img src="https://ui-avatars.com/api/?background=22c55e&color=fff&name=Grif"><div><b>GrifMcPro</b><div>Играет на Выживание #1</div></div><button onclick="alert('Чат')">💬</button></div>`;
}

// Авторизация модалка
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
}

// Инициализация в зависимости от страницы
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateAuthUI();
        
        if (path.includes('shop.html')) loadShop();
        if (path.includes('profile.html')) { loadProfile(); loadOrders(); }
        if (path.includes('chat.html')) { loadMessages(); setInterval(loadMessages, 3000); }
        if (path.includes('index.html')) { loadFeed(); loadRecommended(); loadOnlineFriends(); }
    });
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => auth.signOut();
    }
    
    // Кнопка входа
    const userInfo = document.getElementById('userInfo');
    if (userInfo && !currentUser) {
        userInfo.onclick = showLoginModal;
    }
    
    // Отправка сообщения
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.onclick = sendMessage;
    
    // Закрытие модалки
    const closeBtn = document.querySelector('.close');
    if (closeBtn) closeBtn.onclick = () => document.getElementById('loginModal').style.display = 'none';
    
    // Вход
    const doLogin = document.getElementById('doLogin');
    if (doLogin) {
        doLogin.onclick = async () => {
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPassword').value;
            try {
                await auth.signInWithEmailAndPassword(email, pass);
                document.getElementById('loginModal').style.display = 'none';
                location.reload();
            } catch(e) { alert(e.message); }
        };
    }
    
    // Регистрация
    const doRegister = document.getElementById('doRegister');
    if (doRegister) {
        doRegister.onclick = async () => {
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPassword').value;
            try {
                await auth.createUserWithEmailAndPassword(email, pass);
                document.getElementById('loginModal').style.display = 'none';
                alert('Регистрация успешна!');
            } catch(e) { alert(e.message); }
        };
    }
});
