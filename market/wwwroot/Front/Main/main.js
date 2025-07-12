document.addEventListener("DOMContentLoaded", async () => {
    const accountLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");

    function showNotification(message) {
        const notif = document.getElementById("notification");
        notif.textContent = message;
        notif.classList.add("show");
        setTimeout(() => {
            notif.classList.remove("show");
        }, 1000);
    }

    // 🔽 Обработка перехода при клике на иконку профиля
    accountLink.addEventListener("click", async (event) => {
        event.preventDefault();

        if (!userId) {
            window.location.href = "/Front/Login/login.html";
            return;
        }

        try {
            const response = await fetch("/main/user/get", { method: "GET" });

            if (!response.ok) {
                throw new Error("Ошибка получения пользователя");
            }

            const user = await response.json();

            if (user.role === "admin") {
                window.location.href = "/Front/AdminPage/adminPage.html";
            } else {
                window.location.href = "/Front/Account/account.html";
            }

        } catch (err) {
            console.error("Ошибка при получении роли пользователя:", err);
            window.location.href = "/Front/Login/login.html";
        }
    });


    // 🔽 Попытка загрузить логин пользователя и вставить его в ссылку
    if (userId) {
        try {
            const userResponse = await fetch("/main/user/get", {
                method: "GET"
            });

            if (userResponse.ok) {
                const user = await userResponse.json();
                if (user && user.login) {
                    accountLink.textContent = user.login;
                }
            }
        } catch (err) {
            console.error("Ошибка при получении пользователя:", err);
        }
    }

    // 🔽 Загрузка и отображение товаров
    try {
        const itemsResponse = await fetch("/main/item/get", {
            method: "GET"
        });

        if (!itemsResponse.ok) {
            console.error("Не удалось получить товары");
            return;
        }

        const items = await itemsResponse.json();
        const productGrid = document.querySelector(".product-grid");
        productGrid.innerHTML = "";

        items.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("product-card");
            card.setAttribute("data-id", item.id);

            const iconHTML = item.ico && item.ico.trim() !== ""
                ? `<img src="${item.ico}" alt="${item.name}" class="product-img" style="max-height: 150px; object-fit: contain; margin-bottom: 20px;" />`
                : `<div class="product-icon">📦</div>`;

            card.innerHTML = `
    ${iconHTML}
    <div class="product-name">${item.name}</div>
    <div class="product-price">${item.price ? item.price + "$" : "The price is not specified"}</div>
    <div class="product-buttons">
        <button class="buy-btn">Buy Now</button>
        <button class="details-btn">More Details</button>
    </div>
`;


            productGrid.appendChild(card);
        });

        // 🔽 Обработка кликов по кнопкам на карточках товара
        productGrid.addEventListener("click", async (event) => {
            const card = event.target.closest(".product-card");
            if (!card) return;

            const itemId = card.getAttribute("data-id");
            if (!itemId) return;

            if (event.target.classList.contains("details-btn")) {
                window.location.href = `/Front/Product/product.html?id=${itemId}`;
                return;
            }

            if (event.target.classList.contains("buy-btn")) {
                if (!userId) {
                    showNotification("Please log in to your account");
                    return;
                }

                try {
                    const response = await fetch(`/main/item/add/${itemId}`, {
                        method: "POST"
                    });

                    if (response.ok) {
                        showNotification("Product added to cart");
                    } else {
                        const err = await response.json();
                        showNotification("Ошибка: " + (err.message || response.statusText));
                    }
                } catch (err) {
                    console.error("Ошибка сети:", err);
                    showNotification("Ошибка сети");
                }
            }
        });

    } catch (err) {
        console.error("Ошибка при получении товаров:", err);
    }
});
