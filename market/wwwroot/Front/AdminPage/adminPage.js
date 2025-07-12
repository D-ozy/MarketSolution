document.addEventListener("DOMContentLoaded", () => {
    // Привязка logout к кнопке "Выйти"
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    fetch("/admin/user/get", {
        method: "GET",
        credentials: "include", // Куки обязательны для определения админа
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Сервер вернул ошибку");
            }
            return res.json();
        })
        .then(data => {
            if (data.message) {
                alert(data.message); // не админ
                window.location.href = "/"; // редиректим на главную
                return;
            }

            // Показываем ник админа
            const admin = data.admin;
            document.getElementById("admin-name").textContent = admin.login || "Admin";

            // Рендерим таблицу пользователей
            const users = data.users || data.db?.users || [];
            renderUsers(users);

            // Загружаем товары
            fetchItems();
        })
        .catch(error => {
            console.error("Ошибка при получении данных:", error);
            alert("Ошибка при получении данных администратора.");
        });
});

function renderUsers(users) {
    const container = document.getElementById("user-table");

    if (!Array.isArray(users) || users.length === 0) {
        container.innerHTML = "<p>Пользователи не найдены.</p>";
        return;
    }

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["ID", "Login", "Email", "Role", "Password", "Actions"].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    users.forEach(user => {
        const row = document.createElement("tr");

        ["id", "login", "email", "role", "password"].forEach(field => {
            const td = document.createElement("td");
            td.textContent = user[field] ?? "";
            row.appendChild(td);
        });

        const actionsTd = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.textContent = "Update";
        editBtn.className = "edit-btn";
        editBtn.onclick = () => openEditModal(user);
        actionsTd.appendChild(editBtn);
        row.appendChild(actionsTd);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.innerHTML = "";
    container.appendChild(table);
}


function fetchItems() {
    fetch("/admin/item/get", {
        method: "GET",
        credentials: "include"
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Ошибка при получении товаров");
            }
            return res.json();
        })
        .then(items => {
            renderItems(items);
        })
        .catch(err => {
            console.error("Ошибка загрузки товаров:", err);
            const container = document.getElementById("product-table");
            container.innerHTML = "<p>Ошибка загрузки товаров.</p>";
        });
}

function renderItems(items) {
    const container = document.getElementById("product-table");

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = "<p>Товары не найдены.</p>";
        return;
    }

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["ID", "Name", "Type", "Price", "Quantity", "Brand"].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    items.forEach(item => {
        const row = document.createElement("tr");

        ["id", "name", "type", "price", "quantity", "brand"].forEach(field => {
            const td = document.createElement("td");
            td.textContent = item[field] ?? "";
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.innerHTML = ""; // Очищаем старое содержимое
    container.appendChild(table);
}


function logout() {
    localStorage.removeItem("userId");

    document.cookie = "UserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";

    setTimeout(() => {
        window.location.href = "/Front/LogIn/logIn.html";
    }, 100);
}


function openEditModal(user) {
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-login").value = user.login;
    document.getElementById("edit-email").value = user.email;
    document.getElementById("edit-password").value = user.password;
    document.getElementById("edit-role").value = user.role;

    document.getElementById("edit-modal").style.display = "flex";
}

document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    document.getElementById("edit-modal").style.display = "none";
});

document.getElementById("save-user-btn").addEventListener("click", () => {
    const id = document.getElementById("edit-user-id").value;
    const login = document.getElementById("edit-login").value;
    const email = document.getElementById("edit-email").value;
    const password = document.getElementById("edit-password").value;
    const role = document.getElementById("edit-role").value;

    fetch(`/admin/user/update?UserId=${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, email, password, role })
    })
        .then(res => {
            if (!res.ok) throw new Error("Ошибка при обновлении пользователя");
            return res.json();
        })
        .then(() => {
            document.getElementById("edit-modal").style.display = "none";
            location.reload(); // Перезагрузить, чтобы отобразить изменения
        })
        .catch(err => {
            alert("Ошибка: " + err.message);
        });
});
