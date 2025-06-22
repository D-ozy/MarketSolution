document.addEventListener("DOMContentLoaded", async () => {
    const profileLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");

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

            card.innerHTML = `
                <div class="product-icon">${item.ico || "📦"}</div>
                <div class="product-name">${item.name}</div>
                <button class="buy-btn">Buy Now</button>
            `;

            productGrid.appendChild(card);
        });
    } catch (err) {
        console.error("Ошибка при получении товаров:", err);
    }
});
