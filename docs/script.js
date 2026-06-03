// Авторизация
let currentUser = localStorage.getItem('currentUser');
if (currentUser) {
    document.getElementById('userName') && (document.getElementById('userName').innerText = currentUser);
    document.getElementById('userAvatar') && (document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?background=ff6b6b&color=fff&name=${currentUser}`);
}

document.getElementById('loginBtn')?.addEventListener('click', () => document.getElementById('loginModal').style.display = 'flex');
document.querySelector('.close')?.addEventListener('click', () => document.getElementById('loginModal').style.display = 'none');
document.getElementById('doLogin')?.addEventListener('click', () => {
    let name = document.getElementById('loginName').value;
    if (name) {
        localStorage.setItem('currentUser', name);
        location.reload();
    }
});
document.getElementById('doRegister')?.addEventListener('click', () => alert('Демо-регистрация. Пользователь создан!'));
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    location.reload();
});

// Покупка
document.querySelectorAll('.buy-btn, .buy-mini').forEach(btn => {
    btn.addEventListener('click', () => {
        let product = btn.dataset.product;
        let price = btn.dataset.price;
        alert(`Заказ на ${product} за ${price} ₽ оформлен! После оплаты привилегия придёт автоматически.`);
    });
});

// Табы в профиле
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        let content = document.getElementById('tabContent');
        if (btn.innerText.includes('Друзья')) content.innerHTML = '<div class="friend-item"><img><div><b>GrifMcPro</b><div>Онлайн</div></div><button>💬</button></div>';
        else if (btn.innerText.includes('История')) content.innerHTML = '<div class="order-item">VIP Стандарт - 150 ₽ - Куплен 01.06.2026</div>';
        else content.innerHTML = '<div class="badges-list"><div class="badge-item"><i class="fas fa-crown"></i><div><b>VIP Стандарт</b><div>Истекает: 15.07.2026</div></div></div></div>';
    });
});
