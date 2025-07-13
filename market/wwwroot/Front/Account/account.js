async function loadUserData() {
    const res = await fetch('/account/user/get');
    if (!res.ok) return;
    const user = await res.json();

    document.getElementById('username').textContent = user.login;
    document.getElementById('info-login').textContent = user.login;
    document.getElementById('info-email').textContent = user.email;

    document.getElementById('edit-login').value = user.login;
    document.getElementById('edit-email').value = user.email;
}

async function loadCartItems() {
    const res = await fetch('/account/item/get');
    if (!res.ok) return;

    const data = await res.json();
    const container = document.querySelector('.cart-items');
    container.innerHTML = '';

    data.items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('item-card');

        card.innerHTML = `
            <img src="${item.ico}" alt="${item.name}" />
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-type">${item.type}</span>
                <span class="item-price">${item.price}$</span>
                <span class="item-qty">Quantity: ${item.quantity}</span>
                <button class="remove-btn" data-id="${item.id}">Delete</button>
            </div>
        `;

        container.appendChild(card);
    });

    document.getElementById('cart-total').textContent = `${data.total} $`;
}

function setupRemoveButtons() {
    const buttons = document.querySelectorAll('.remove-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const itemId = btn.getAttribute('data-id');

            try {
                const res = await fetch('/account/item/Remove', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: itemId })
                });

                if (!res.ok) {
                    const err = await res.json();
                    showNotification(err.message || 'Deletion error');
                    return;
                }

                await loadCartItems();
                setupRemoveButtons();
            } catch (err) {
                console.error('Error when deleting:', err);
            }
        });
    });
}

function logout() {
    localStorage.removeItem("userId");
    document.cookie = "UserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";
    setTimeout(() => {
        window.location.href = "/Front/LogIn/logIn.html";
    }, 100);
}

function openEditModal() {
    document.querySelector('.modal').style.display = 'flex';
}

function closeEditModal() {
    document.querySelector('.modal').style.display = 'none';
}

async function updateUser(e) {
    e.preventDefault();

    const login = document.getElementById('edit-login').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const password = document.getElementById('edit-password').value;

    if (!password) {
        alshowNotificationert("The password field must not be empty.");
        return;
    }

    const res = await fetch('/account/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, email, password })
    });

    const data = await res.json();

    if (res.ok) {
        showNotification(data.message);
        closeEditModal();
        loadUserData();
    } else {
        showNotification(data.message || 'Error when updating');
    }
}

// ---------- 📨 MESSAGE FUNCTIONALITY ----------------

function toggleMessageBox(show) {
    const box = document.getElementById('message-box');
    box.style.display = show ? 'flex' : 'none';
    if (!show) {
        document.getElementById('message-input').value = '';
    }
}

async function sendMessage() {
    const text = document.getElementById('message-input').value.trim();

    if (!text) {
        showNotification("Message cannot be empty.");
        return;
    }

    const res = await fetch('/request/message/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })

    });

    const data = await res.json();

    if (res.ok) {
        showNotification("Your message has been sent!");
        toggleMessageBox(false);
    } else {
        showNotification(data.message || "Failed to send message");
    }
}

// ----------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadCartItems().then(setupRemoveButtons);

    document.querySelector('.logout-btn').addEventListener('click', logout);
    document.querySelector('.edit-btn').addEventListener('click', openEditModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeEditModal);
    document.getElementById('edit-form').addEventListener('submit', updateUser);

    document.querySelector('.home-btn').addEventListener('click', () => {
        window.location.href = '/Front/Main/main.html';
    });

    // 💬 Message logic
    document.getElementById('message-button').addEventListener('click', () => toggleMessageBox(true));
    document.getElementById('cancel-message').addEventListener('click', () => toggleMessageBox(false));
    document.getElementById('send-message').addEventListener('click', sendMessage);
});


function showNotification(message) {
    const notif = document.getElementById("notification");
    notif.textContent = message;
    notif.classList.add("show");
    setTimeout(() => {
        notif.classList.remove("show");
    }, 1000);
}
