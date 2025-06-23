document.addEventListener("DOMContentLoaded", async () => {
    const profileLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");

    function showNotification(message) {
        const notif = document.getElementById("notification");
        notif.textContent = message;
        notif.classList.add("show");
        setTimeout(() => {
            notif.classList.remove("show");
        }, 1000);
    }

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
                <div class="product-buttons">
                    <button class="buy-btn">Buy Now</button>
                    <button class="details-btn">More Details</button>
                </div>
            `;

            productGrid.appendChild(card);
        });

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
