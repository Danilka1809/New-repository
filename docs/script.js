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

function updateAuthUI() {
    const authDiv = document.getElementById('authStatus');
    if (authDiv) {
        authDiv.innerHTML = currentUser ? `<span>👤 ${currentUser.email}</span>` : `<span>👤 Не авторизован</span>`;
    }
}

function showMessage(msg) { alert(msg); }

function loadShop() {
    const container = document.getElementById('shopGrid');
    if (!container) return;
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <h3>${p.name}</h3>
            <div class="price">${p.price} ₽</div>
            <div>${p.days}</div>
            <ul>${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul>
            <button class="buy-btn" onclick="buyProduct('${p.id}', ${p.price})">Купить</button>
        </div>
    `).join('');
}

window.buyProduct = async (productId, price) => {
    if (!currentUser) { alert('Сначала войдите в аккаунт'); return; }
    await db.collection('orders').add({ userId: currentUser.uid, productId, price, date: new Date().toISOString(), status: 'Активен' });
    alert(`Заказ на ${price} ₽ оформлен! После оплаты привилегия придёт автоматически.`);
};

async function loadProfile() {
    const container = document.getElementById('profileCard');
    if (!container) return;
    if (!currentUser) { container.innerHTML = '<p>Войдите, чтобы увидеть профиль</p>'; return; }
    container.innerHTML = `<h2>${currentUser.email}</h2><p>Дата регистрации: ${currentUser.metadata.creationTime}</p>`;
}

async function loadOrders() {
    const container = document.getElementById('tabContent');
    if (!container) return;
    if (!currentUser) { container.innerHTML = '<p>Войдите, чтобы увидеть историю</p>'; return; }
    const snapshot = await db.collection('orders').where('userId', '==', currentUser.uid).get();
    let html = '<div class="orders-list">';
    snapshot.forEach(doc => { let o = doc.data(); html += `<div class="order-item">${o.productId} - ${o.price} ₽ - ${o.status}</div>`; });
    container.innerHTML = html + '</
