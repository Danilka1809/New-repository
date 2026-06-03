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

function showToast(msg, color = '#ff6b6b') { let t = document.createElement('div'); t.innerText = msg; t.style.position = 'fixed'; t.style.bottom = '20px'; t.style.right = '20px'; t.style.backgroundColor = color; t.style.padding = '12px 24px'; t.style.borderRadius = '40px'; t.style.zIndex = '1000'; t.style.color = 'white'; document.body.appendChild(t); setTimeout(() => t.remove(), 3000); }

async function sendEmail(subject, text) { await fetch('https://api.web3forms.com/submit', { method: 'POST', body: JSON.stringify({ access_key: '42864224-6df0-4e25-8068-7b486cf314dd', name: 'GrifLauncher', email: 'ramonenok@bk.ru', subject: subject, message: text }), headers: { 'Content-Type': 'application/json' } }).catch(console.error); }

async function updateAuthStatus() {
    const container = document.getElementById('authStatus');
    if (!container) return;
    if (currentUser) {
        let doc = await db.collection('profiles').doc(currentUser.uid).get();
        let name = doc.exists ? doc.data().username : currentUser.email;
        container.innerHTML = `<span>👤 ${name}</span> <button onclick="logout()" style="background:#444; padding:4px 12px; border-radius:40px; margin-left:12px;">Выйти</button>`;
    } else {
        container.innerHTML = `<button onclick="showLogin()" style="background:#ff6b6b; padding:6px 16px; border-radius:40px;">Войти</button>`;
    }
}
window.logout = async () => { await auth.signOut(); location.reload(); };
window.showLogin = () => { alert('Форма входа откроется отдельно, но проще перейти на profile.html'); };

async function loadGlobalChat() { if (document.getElementById('globalChat')) { db.collection('globalChat').orderBy('timestamp').limit(50).onSnapshot(snap => { let html = ''; snap.forEach(d => { let m = d.data(); html += `<div><b>${m.name}</b>: ${m.text}</div>`; }); document.getElementById('globalChat').innerHTML = html; }); } }
document.getElementById('sendGlobalChat')?.addEventListener('click', async () => {
    let inp = document.getElementById('globalChatInput');
    if (inp.value.trim() && currentUser) {
        let doc = await db.collection('profiles').doc(currentUser.uid).get();
        let name = doc.exists ? doc.data().username : currentUser.email;
        await db.collection('globalChat').add({ name, text: inp.value, timestamp: Date.now() });
        inp.value = '';
    } else if (!currentUser) showToast('Войдите в аккаунт!', '#ef4444');
});

async function loadOrders() { if (document.getElementById('ordersList')) { let snap = await db.collection('orders').where('userId', '==', currentUser?.uid).get(); let html = ''; snap.forEach(d => { let o = d.data(); html += `<div class="order-item"><div><b>${o.product}</b><br>${o.date}</div><div>${o.status}</div></div>`; }); document.getElementById('ordersList').innerHTML = html || '<p>Нет заказов</p>'; } }

async function loadNews() { if (document.getElementById('newsList')) { let snap = await db.collection('news').orderBy('date', 'desc').limit(5).get(); let html = ''; snap.forEach(d => { let n = d.data(); html += `<div class="news-item"><h3>${n.title}</h3><p>${n.content}</p><small>${n.date}</small></div>`; }); document.getElementById('newsList').innerHTML = html; } }

async function loadShop() { if (document.getElementById('shopGrid')) { let html = '<div class="store-grid">'; products.forEach(p => { html += `<div class="card"><h3>${p.name}</h3><div class="price">${p.price} ₽ <small>${p.days}</small></div><ul>${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul><input type="text" id="nick_${p.key}" placeholder="Ваш ник"><button class="buy-btn" onclick="buy('${p.key}', ${p.price})">Купить</button></div>`; }); html += '</div>'; document.getElementById('shopGrid').innerHTML = html; } }

window.buy = async (key, price) => {
    let nick = document.getElementById(`nick_${key}`)?.value;
    if (!nick) { showToast('Введи ник!', '#ef4444'); return; }
    showToast('Заказ оформлен! Ожидайте письма.', '#ff6b6b');
    await sendEmail('Покупка доната', `Игрок ${nick} хочет купить ${key} за ${price} ₽`);
    if (currentUser) await db.collection('orders').add({ userId: currentUser.uid, product: key, price, date: new Date().toLocaleString(), status: 'Ожидает оплаты' });
};

auth.onAuthStateChanged(async (user) => { currentUser = user; await updateAuthStatus(); await loadNews(); await loadShop(); await loadGlobalChat(); await loadOrders(); });
