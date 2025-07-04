async function loadUserData() {
    const res = await fetch('/account/user/get');
    if (!res.ok) return;
    const user = await res.json();

    document.getElementById('username').textContent = user.login;
    document.getElementById('info-login').textContent = user.login;
    document.getElementById('info-email').textContent = user.email;

    // Optional: Подставить текущие данные в форму редактирования
    document.getElementById('edit-login').value = user.login;
    document.getElementById('edit-email').value = user.email;
}

async function loadCartItems() {
    const res = await fetch('/account/item/get');
    if (!res.ok) return;

    const items = await res.json();
    const container = document.querySelector('.cart-items');
    container.innerHTML = '';

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
                <button class="remove-btn" data-id="${item.id}">Delete</button>
            </div>
        `;

        container.appendChild(card);
    });
}

function setupRemoveButtons() {
    const buttons = document.querySelectorAll('.remove-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const itemId = btn.getAttribute('data-id');

            try {
                const res = await fetch('/account/item/Remove', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: itemId })
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert(err.message || 'Ошибка удаления');
                    return;
                }

                await loadCartItems();
                setupRemoveButtons(); // Повторная привязка
            } catch (err) {
                console.error('Ошибка при удалении:', err);
            }
        });
    });
}

function logout() {
    document.cookie = "UserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/Front/LogIn/logIn.html";
}

function openEditModal() {
    document.querySelector('.modal').style.display = 'flex';
}

function closeEditModal() {
    document.querySelector('.modal').style.display = 'none';
}

async function updateUser(e) {
    e.preventDefault();

    const login = document.getElementById('edit-login').value;
    const email = document.getElementById('edit-email').value;
    const password = document.getElementById('edit-password').value;

    const res = await fetch('/account/user/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, email, password })
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message);
        closeEditModal();
        loadUserData();
    } else {
        alert(data.message || 'Ошибка при обновлении');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadCartItems().then(() => {
        setupRemoveButtons();
    });

    document.querySelector('.logout-btn').addEventListener('click', logout);
    document.querySelector('.edit-btn').addEventListener('click', openEditModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeEditModal);
    document.getElementById('edit-form').addEventListener('submit', updateUser);
});
