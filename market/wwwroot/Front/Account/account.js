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


async function loadUserRequests() {
    const res = await fetch('/account/request/get');
    if (!res.ok) {
        console.error('Failed to fetch user requests.');
        return;
    }

    const data = await res.json();
    const tableBody = document.getElementById('requests-table-body');
    tableBody.innerHTML = '';

    const statusMap = {
        0: 'Open',
        1: 'Progress',
        2: 'Closed'
    };

    if (data.userRequests && data.userRequests.length > 0) {
        data.userRequests.forEach(req => {
            const row = document.createElement('tr');
            const statusText = statusMap[req.status] ?? 'Unknown';

            row.innerHTML = `
                <td>${data.login}</td>
                <td>${req.message || 'No message'}</td>
                <td>${req.reply || 'No reply yet'}</td>
                <td>${statusText}</td>
                <td>
                    <button class="update-request-btn" data-id="${req.id}" data-message="${req.message ?? ''}">Update</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        setupUpdateRequestButtons(); // ✅ переместим сюда, чтобы не было ошибки
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5">No requests found.</td>`;
        tableBody.appendChild(row);
    }
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

    // Получаем элемент для отображения ошибок
    const errorMessage = document.getElementById('edit-error-message');
    if (errorMessage) errorMessage.textContent = "";

    // Проверка: пароль не должен быть пустым
    if (!password) {
        if (errorMessage) {
            errorMessage.textContent = "The password field must not be empty.";
        } else {
            alert("The password field must not be empty.");
        }
        return;
    }

    // Проверка: длина пароля
    if (password.length < 8) {
        if (errorMessage) {
            errorMessage.textContent = "Password must be at least 8 characters long.";
        } else {
            alert("Password must be at least 8 characters long.");
        }
        return;
    }

    try {
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
    } catch (err) {
        showNotification('Network or server error');
        console.error(err);
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
    loadUserRequests(); // ← ADD THIS LINE

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




function setupUpdateRequestButtons() {
    document.querySelectorAll('.update-request-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const requestId = btn.dataset.id;
            const currentMessage = btn.dataset.message;

            const modal = document.getElementById('update-request-modal');
            const input = document.getElementById('update-request-input');
            input.value = currentMessage;
            modal.dataset.requestId = requestId;

            modal.classList.remove('hidden');
        });
    });
}


document.getElementById('confirm-update-request').addEventListener('click', async () => {
    const modal = document.getElementById('update-request-modal');
    const newMessage = document.getElementById('update-request-input').value.trim();
    const requestId = modal.dataset.requestId;

    if (!newMessage) {
        showNotification("Message cannot be empty.");
        return;
    }

    try {
        const res = await fetch(`/account/request/update?requestId=${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: newMessage })
        });

        const data = await res.json();

        if (res.ok) {
            showNotification("Request updated.");
            modal.classList.add('hidden');
            loadUserRequests(); // refresh list
        } else {
            showNotification(data.message || 'Update failed.');
        }
    } catch (err) {
        console.error("Update error", err);
        showNotification("Network error");
    }
});

document.getElementById('cancel-update-request').addEventListener('click', () => {
    document.getElementById('update-request-modal').classList.add('hidden');
});
