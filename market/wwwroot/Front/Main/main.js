document.addEventListener("DOMContentLoaded", async () => {
    const accountLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");

    // 🔽 Обработка перехода при клике на иконку профиля
    accountLink.addEventListener("click", async (event) => {
        event.preventDefault();

        if (!userId) {
            window.location.href = "/Front/LogIn/logIn.html";
            return;
        }

        try {
            const response = await fetch("/main/user/get", { method: "GET" });

            if (!response.ok) {
                throw new Error("Error when receiving the user:");
            }

            const user = await response.json();

            if (user.role === "admin") {
                window.location.href = "/Front/AdminPage/adminPage.html";
            } else {
                window.location.href = "/Front/Account/account.html";
            }

        } catch (err) {
            console.error("Error when receiving the user:", err);
            window.location.href = "/Front/LogIn/logIn.html";
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
                // Проверка роли для скрытия кнопки
                if (user.role === "admin") {
                    const messageBtn = document.getElementById("message-button");
                    if (messageBtn) {
                        messageBtn.style.display = "none";
                    }
                }
            }
        } catch (err) {
            console.error("Error when receiving the user:", err);
        }
    }

    // 🔽 Загрузка и отображение товаров
    try {
        const itemsResponse = await fetch("/main/item/get", {
            method: "GET"
        });

        if (!itemsResponse.ok) {
            console.error("Did you manage to receive the goods");
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
                        showNotification("Error: " + (err.message || response.statusText));
                    }
                } catch (err) {
                    console.error("Network error", err);
                    showNotification("Network error");
                }
            }
        });

    } catch (err) {
        console.error("Error when receiving the goods:", err);
    }
});

function showNotification(message) {
    const notif = document.getElementById("notification");
    notif.textContent = message;
    notif.classList.add("show");
    setTimeout(() => {
        notif.classList.remove("show");
    }, 1000);
}

const messageBtn = document.getElementById("message-button");
const messageBox = document.getElementById("message-box");
const sendBtn = document.getElementById("send-message");
const cancelBtn = document.getElementById("cancel-message");
const messageInput = document.getElementById("message-input");

// Показать/скрыть окно
messageBtn.addEventListener("click", () => {
    messageBox.style.display = "flex";
    messageInput.focus();
});

// Закрыть окно
cancelBtn.addEventListener("click", () => {
    messageInput.value = "";
    messageBox.style.display = "none";
});

// Отправка сообщения
sendBtn.addEventListener("click", async () => {
    const messageText = messageInput.value.trim();
    if (!messageText) {
        showNotification("Message is empty");
        return;
    }

    try {
        const response = await fetch("/request/message/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: messageText
            })
        });

        if (response.ok) {
            const result = await response.json();
            showNotification("Message sent to admin");
            messageInput.value = "";
            messageBox.style.display = "none";
        } else {
            const error = await response.json();
            showNotification("Error: " + (error.message || "Something went wrong"));
        }
    } catch (err) {
        console.error("Failed to send message", err);
        showNotification("Network error");
    }
});
