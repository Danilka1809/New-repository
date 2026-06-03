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

const products = [
    { name: '🎖️ VIP Стандарт', price: 150, key: 'vip', days: '10 дней', features: ['Цветной ник', 'Команда /kit', '/fly'] },
    { name: '👑 VIP+ Продвинутый', price: 350, key: 'vip_plus', days: '30 дней', features: ['Всё из VIP', 'VIP-чат', '/heal'] },
    { name: '💎 MVP Вечный', price: 1000, key: 'mvp', days: 'Навсегда', features: ['Всё из VIP+', 'Префикс [KING]', '/god'] }
];

function showToast(msg, color = '#ff6b6b') {
    let t = document.createElement('div');
    t.innerText = msg;
    t.style.position = 'fixed';
    t.style.bottom = '20px';
    t.style.right = '20px';
    t.style.backgroundColor = color;
    t.style.padding = '12px 24px';
    t.style.borderRadius = '40px';
    t.style.zIndex = '1000';
    t.style.color = 'white';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

async function sendEmail(subject, text) {
    await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: JSON.stringify({ access_key: '42864224-6df0-4e25-8068-7b486cf314dd', name: 'GrifLauncher', email: 'ramonenok@bk.ru', subject: subject, message: text }),
        headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);
}

async function updateAuthStatus() {
    let container = document.getElementById('authStatus');
    if (!container) return;
    if (currentUser) {
        let doc = await db.collection('profiles').doc(currentUser.uid).get();
        let name = doc.exists ? doc.data().username : currentUser.email;
        container.innerHTML = `<span>👤 ${name}</span> <button onclick="logout()">Выйти</button>`;
    } else {
        container.innerHTML = `<button onclick="showLogin()">Войти</button>`;
    }
}

window.logout = async () => { await auth.signOut(); location.reload(); };
window.showLogin = () => { showToast('Авторизация через Firebase работает, но для удобства зарегистрируйтесь на странице Профиль', '#ff6b6b'); };

async function loadGlobalChat() {
    if (!document.getElementById('globalChat')) return;
    db.collection('globalChat').orderBy('timestamp', 'asc').onSnapshot(snap => {
        let html = '';
        snap.forEach(d => { let m = d.data(); html += `<div><b>${m.name}</b>: ${m.text}</div>`; });
        document.getElementById('globalChat').innerHTML = html;
    });
}

document.getElementById('sendGlobalChat')?.addEventListener('click', async () => {
    let inp = document.getElementById('globalChatInput');
    if (inp.value.trim() && currentUser) {
        let doc = await db.collection('profiles').doc(currentUser.uid).get();
        let name = doc.exists ? doc.data().username : currentUser.email;
        await db.collection('globalChat').add({ name, text: inp.value, timestamp: Date.now() });
        inp.value = '';
    } else if (!currentUser) showToast('Войдите в аккаунт!', '#ef4444');
});

async function loadNews() {
    if (!document.getElementById('newsList')) return;
    let snap = await db.collection('news').orderBy('date', 'desc').limit(5).get();
    let html = '';
    snap.forEach(d => { let n = d.data(); html += `<div class="news-item"><h3>${n.title}</h3><p>${n.content}</p><small>${n.date}</small></div>`; });
    document.getElementById('newsList').innerHTML = html || '<p>Новости скоро появятся</p>';
}

async function loadShop() {
    if (!document.getElementById('shopGrid')) return;
    let html = '<div class="store-grid">';
    products.forEach(p => {
        html += `<div class="card"><h3>${p.name}</h3><div class="price">${p.price} ₽ <small>${p.days}</small></div><ul>${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul><input type="text" id="nick_${p.key}" placeholder="Ваш ник"><button class="buy-btn" onclick="buy('${p.key}', ${p.price})">Купить</button></div>`;
    });
    html += '</div>';
    document.getElementById('shopGrid').innerHTML = html;
}

window.buy = async (key, price) => {
    let nick = document.getElementById(`nick_${key}`)?.value;
    if (!nick) { showToast('Введи ник!', '#ef4444'); return; }
    showToast('Заказ оформлен! Ожидайте письма.', '#ff6b6b');
    await sendEmail('Покупка доната', `Игрок ${nick} хочет купить ${key} за ${price} ₽`);
    if (currentUser) await db.collection('orders').add({ userId: currentUser.uid, product: key, price, date: new Date().toLocaleString(), status: 'Ожидает оплаты' });
};

async function loadOrders() {
    if (!document.getElementById('ordersList')) return;
    if (!currentUser) { document.getElementById('ordersList').innerHTML = '<p>Войдите, чтобы увидеть историю заказов</p>'; return; }
    let snap = await db.collection('orders').where('userId', '==', currentUser.uid).get();
    let html = '';
    snap.forEach(d => { let o = d.data(); html += `<div class="order-item"><div><b>${o.product}</b><br>${o.date}</div><div>${o.status}</div></div>`; });
    document.getElementById('ordersList').innerHTML = html || '<p>Нет заказов</p>';
}

async function loadProfile() {
    if (!document.getElementById('profileCard')) return;
    if (!currentUser) {
        document.getElementById('profileCard').innerHTML = `<div class="profile-card"><h3>Войдите в аккаунт</h3><input type="email" id="loginEmail" placeholder="Email"><input type="password" id="loginPass" placeholder="Пароль"><button onclick="doLogin()">Войти</button><button onclick="doRegister()">Зарегистрироваться</button></div>`;
        return;
    }
    let doc = await db.collection('profiles').doc(currentUser.uid).get();
    let name = doc.exists ? doc.data().username : currentUser.email;
    let balance = doc.exists ? doc.data().balance : 0;
    document.getElementById('profileCard').innerHTML = `<div class="profile-card"><h3>👤 ${name}</h3><p>💰 Баланс GM: ${balance}</p><p>📧 ${currentUser.email}</p></div>`;
}

window.doLogin = async () => {
    let email = document.getElementById('loginEmail').value;
    let pass = document.getElementById('loginPass').value;
    try { await auth.signInWithEmailAndPassword(email, pass); showToast('Вход выполнен'); location.reload(); } catch(e) { showToast(e.message, '#ef4444'); }
};

window.doRegister = async () => {
    let email = document.getElementById('loginEmail').value;
    let pass = document.getElementById('loginPass').value;
    let name = prompt('Введите ваш никнейм');
    if (!name) return;
    try {
        let { user } = await auth.createUserWithEmailAndPassword(email, pass);
        await db.collection('profiles').doc(user.uid).set({ username: name, balance: 0 });
        showToast('Регистрация успешна'); location.reload();
    } catch(e) { showToast(e.message, '#ef4444'); }
};

async function loadSideChat() {
    if (!document.getElementById('chatMessages')) return;
    db.collection('globalChat').orderBy('timestamp', 'asc').onSnapshot(snap => {
        let html = '';
        snap.forEach(d => { let m = d.data(); html += `<div><b>${m.name}</b>: ${m.text}</div>`; });
        document.getElementById('chatMessages').innerHTML = html;
    });
}

document.getElementById('sendChatBtn')?.addEventListener('click', async () => {
    let inp = document.getElementById('chatInput');
    if (inp.value.trim() && currentUser) {
        let doc = await db.collection('profiles').doc(currentUser.uid).get();
        let name = doc.exists ? doc.data().username : currentUser.email;
        await db.collection('globalChat').add({ name, text: inp.value, timestamp: Date.now() });
        inp.value = '';
    } else if (!currentUser) showToast('Войдите в аккаунт', '#ef4444');
});

auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    await updateAuthStatus();
    await loadNews();
    await loadShop();
    await loadGlobalChat();
    await loadOrders();
    await loadProfile();
    await loadSideChat();
});
