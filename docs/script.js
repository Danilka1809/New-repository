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
    container.innerHTML = html + '</div>';
}

async function loadMessages() {
    const container = document.getElementById('messages');
    if (!container) return;
    const snapshot = await db.collection('globalChat').orderBy('timestamp').limit(50).get();
    container.innerHTML = snapshot.docs.map(doc => {
        let m = doc.data();
        return `<div class="message"><b>${m.userEmail}:</b> ${m.text}<br><small>${new Date(m.timestamp).toLocaleTimeString()}</small></div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input || !currentUser) return;
    if (input.value.trim()) {
        await db.collection('globalChat').add({ userEmail: currentUser.email, text: input.value, timestamp: Date.now() });
        input.value = '';
        loadMessages();
    }
}

async function loadFeed() {
    const container = document.getElementById('feedList');
    if (!container) return;
    const snapshot = await db.collection('feed').orderBy('timestamp', 'desc').limit(10).get();
    container.innerHTML = snapshot.docs.map(doc => {
        let f = doc.data();
        return `<div class="feed-item"><div><b>${f.user}</b><div class="feed-text">${f.text}</div><div class="feed-time">${new Date(f.timestamp).toLocaleString()}</div></div></div>`;
    }).join('');
}

function loadPopularProducts() {
    const container = document.getElementById('popularProducts');
    if (!container) return;
    container.innerHTML = products.slice(0,2).map(p => `
        <div class="product-mini">
            <div><b>${p.name}</b><div>${p.price} ₽ / ${p.days}</div></div>
            <button class="buy-mini" onclick="buyProduct('${p.id}', ${p.price})">Купить</button>
        </div>
    `).join('');
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        updateAuthUI();
        if (path.includes('shop.html')) loadShop();
        if (path.includes('profile.html')) { loadProfile(); loadOrders(); }
        if (path.includes('chat.html')) { loadMessages(); setInterval(loadMessages, 3000); }
        if (path.includes('index.html')) { loadFeed(); loadPopularProducts(); }
    });
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.onclick = () => auth.signOut();
    
    const userInfo = document.getElementById('userInfo');
    if (userInfo) userInfo.onclick = () => { if (!currentUser) showLoginModal(); };
    
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.onclick = sendMessage;
    
    const closeBtn = document.querySelector('.close');
    if (closeBtn) closeBtn.onclick = () => document.getElementById('loginModal').style.display = 'none';
    
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
