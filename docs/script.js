// ========== ОТПРАВКА НА ПОЧТУ (через Web3Forms) ==========
async function sendEmailNotification(nickname, privilegeName, price, server) {
    const formData = new FormData();
    formData.append('access_key', '483fce89-6fa4-4704-bc74-1dac5cfcf0d0');
    formData.append('email', 'ramonenok@bk.ru');
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
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        console.log('Почта отправлена:', result);
        return result.success === true;
    } catch (err) {
        console.error('Ошибка отправки почты:', err);
        return false;
    }
}
