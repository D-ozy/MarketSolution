document.addEventListener("DOMContentLoaded", async () => {
    const profileLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");

    // Показ уведомления
    function showNotification(message) {
        const notif = document.getElementById("notification");
        notif.textContent = message;
        notif.classList.add("show");
        setTimeout(() => {
            notif.classList.remove("show");
        }, 1000);
    }

    // Получение пользователя
    if (userId) {
        try {
            const userResponse = await fetch("/main/user/get", {
                method: "GET",
                headers: {
                    "X-User-Id": userId
                }
            });

            if (userResponse.ok) {
                const user = await userResponse.json();
                if (user && user.login) {
                    profileLink.textContent = user.login;
                }
            }
        } catch (err) {
            console.error("Ошибка при получении пользователя:", err);
        }
    }

    // Получение и отображение товаров
    try {
        const itemsResponse = await fetch("/main/item/get", {
            method: "GET"
        });

        if (!itemsResponse.ok) {
            console.error("Не удалось получить товары");
            return;
        }

        const items = await itemsResponse.json();
        console.log("Список товаров:", items);

        const productGrid = document.querySelector(".product-grid");
        productGrid.innerHTML = ""; // Очистить содержимое

        items.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("product-card");
            card.setAttribute("data-id", item.id); // id - должен быть GUID

            const iconHTML = item.ico && item.ico.trim() !== ""
                ? `<img src="${item.ico}" alt="${item.name}" class="product-img" style="max-height: 150px; object-fit: contain; margin-bottom: 20px;" />`
                : `<div class="product-icon">📦</div>`;

            card.innerHTML = `
                ${iconHTML}
                <div class="product-name">${item.name}</div>
                <button class="buy-btn">Buy Now</button>
            `;

            productGrid.appendChild(card);
        });

        // Обработчик клика на кнопку "Buy Now"
        productGrid.addEventListener("click", async (event) => {
            if (!event.target.classList.contains("buy-btn")) return;

            const card = event.target.closest(".product-card");
            if (!card) return;

            const itemId = card.getAttribute("data-id");
            if (!itemId) {
                console.error("Не найден itemId для товара");
                return;
            }

            if (!userId) {
                showNotification("Пожалуйста, войдите в аккаунт");
                return;
            }

            try {
                const response = await fetch(`/main/item/add/${itemId}`, {
                    method: "POST",
                    headers: {
                        "X-User-Id": userId
                    }
                });

                if (response.ok) {
                    showNotification("Товар добавлен в корзину");
                } else {
                    const err = await response.json();
                    showNotification("Ошибка: " + (err.message || response.statusText));
                }
            } catch (err) {
                console.error("Ошибка сети:", err);
                showNotification("Ошибка сети");
            }
        });

    } catch (err) {
        console.error("Ошибка при получении товаров:", err);
    }
});
