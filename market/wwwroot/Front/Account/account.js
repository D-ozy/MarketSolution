let currentUser = null;

// Загрузка данных пользователя
async function loadUserData() {
    try {
        const res = await fetch('/account/user/get');
        if (!res.ok) throw new Error('Failed to fetch user');

        const user = await res.json();
        currentUser = user;

        document.getElementById('info-login').textContent = user.login;
        document.getElementById('info-email').textContent = user.email || '(none)';
        document.getElementById('info-password').textContent = '********';
        document.getElementById('username').textContent = user.login;
    } catch (err) {
        console.error('Error loading user data:', err);
    }
}

// Загрузка товаров корзины
async function loadCartItems() {
    try {
        const response = await fetch('/account/item/get');
        if (!response.ok) throw new Error('Failed to fetch cart items');

        const items = await response.json();
        const container = document.querySelector('.cart-items');
        container.innerHTML = ''; // Очистка старых данных

        items.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('item-card');

            card.innerHTML = `
                <img src="${item.ico}" alt="${item.name}" />
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-type">${item.type}</span>
                    <span class="item-price">${item.price}₽</span>
                    <span class="item-qty">Quantity: ${item.quantity}</span>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading cart items:', err);
    }
}

// Открытие модального окна
function openEditModal() {
    if (!currentUser) return;

    document.getElementById('edit-login').value = currentUser.login;
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-password').value = currentUser.password;

    document.getElementById('edit-modal').classList.remove('hidden');
}

// Закрытие модального окна
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

// Отправка обновлённых данных пользователя
async function updateUser(event) {
    event.preventDefault();

    const login = document.getElementById('edit-login').value;
    const email = document.getElementById('edit-email').value;
    const password = document.getElementById('edit-password').value;

    try {
        const res = await fetch('/account/user/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login, email, password })
        });

        const result = await res.json();

        if (res.ok) {
            alert('User updated successfully');
            closeEditModal();
            loadUserData();
        } else {
            alert(result.message || 'Update failed');
        }
    } catch (err) {
        console.error('Error updating user:', err);
    }
}

// Выход
function logout() {
    document.cookie = "UserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
}

// Инициализация после загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadCartItems();

    document.querySelector('.logout-btn').addEventListener('click', logout);
    document.querySelector('.edit-btn').addEventListener('click', openEditModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeEditModal);
    document.getElementById('edit-form').addEventListener('submit', updateUser);
});
