document.addEventListener("DOMContentLoaded", () => {
    const profileLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");
    const buyNowBtn = document.getElementById("buy-now");

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get("id");

    // 🔽 Обработка перехода при клике на иконку профиля
    if (profileLink) {
        profileLink.addEventListener("click", (event) => {
            event.preventDefault();

            if (!userId) {
                window.location.assign("/Front/LogIn/logIn.html");
                return;
            }

            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                    const user = JSON.parse(userData);

                    if (user.role === "admin") {
                        window.location.assign("/Front/AdminPage/adminPage.html");
                    } else if (user.role === "user") {
                        window.location.assign("/Front/Account/account.html");
                    } else {
                        window.location.assign("/Front/Account/account.html"); // fallback
                    }
                } catch (e) {
                    console.error("Ошибка при разборе user:", e);
                    window.location.assign("/Front/Account/account.html");
                }
            } else {
                window.location.assign("/Front/Account/account.html");
            }
        });
    }

    // 🔽 Показываем имя пользователя в header и скрываем кнопку для admin
    if (userId && profileLink) {
        fetch("https://marketsolution.onrender.com/product/user/get", {
            method: "GET",
            credentials: "include"
        })
            .then(res => res.json())
            .then(user => {
                if (user && user.login) {
                    profileLink.textContent = user.login;
                    localStorage.setItem("user", JSON.stringify(user)); // сохраняем user в localStorage
                }

                if (user.role === "admin") {
                    const messageBtn = document.getElementById("message-button");
                    if (messageBtn) {
                        messageBtn.style.display = "none";
                    }
                }
            })
            .catch(err => console.error("User Receipt Error:", err));
    }

    // 🔽 Загружаем товар
    if (itemId) {
        loadProduct(itemId);
    }

    // 🔽 Обработка кнопки "Buy Now"
    if (buyNowBtn && itemId) {
        buyNowBtn.addEventListener("click", async () => {
            try {
                const res = await fetch(`https://marketsolution.onrender.com/product/item/add?id=${itemId}`, {
                    method: "POST",
                    credentials: "include"
                });

                if (res.ok) {
                    showNotification("Item added to cart");
                } else {
                    showNotification("Error when adding");
                }
            } catch (err) {
                console.error("Error when adding:", err);
                showNotification("Connection error");
            }
        });
    }

    // --- Логика для окна сообщений (Ask Admin) ---
    const messageBtn = document.getElementById("message-button");
    const messageBox = document.getElementById("message-box");
    const sendMsgBtn = document.getElementById("send-message");
    const cancelMsgBtn = document.getElementById("cancel-message");
    const messageInput = document.getElementById("message-input");

    // Показываем/скрываем окно сообщения при клике на кнопку
    if (messageBtn && messageBox) {
        messageBtn.addEventListener("click", () => {
            if (messageBox.style.display === "block") {
                messageBox.style.display = "none";
            } else {
                messageBox.style.display = "block";
                messageInput.focus();
            }
        });
    }

    // Отмена сообщения — просто скрываем окно и очищаем поле
    if (cancelMsgBtn && messageBox && messageInput) {
        cancelMsgBtn.addEventListener("click", () => {
            messageInput.value = "";
            messageBox.style.display = "none";
        });
    }

    // Отправка сообщения на бекенд
    if (sendMsgBtn && messageInput && messageBox) {
        sendMsgBtn.addEventListener("click", async () => {
            const messageText = messageInput.value.trim();
            if (!messageText) {
                showNotification("Please enter a message");
                return;
            }

            try {
                const response = await fetch("https://marketsolution.onrender.com/request/message/add", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ message: messageText })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.message) {
                        showNotification(data.message);
                    } else {
                        showNotification("Message sent");
                    }
                    messageInput.value = "";
                    messageBox.style.display = "none";
                } else {
                    showNotification("Failed to send message");
                }
            } catch (error) {
                console.error("Send message error:", error);
                showNotification("Connection error");
            }
        });
    }
});

// 🔽 Показ уведомления
function showNotification(message) {
    let notif = document.getElementById("notification");
    if (!notif) {
        notif = document.createElement("div");
        notif.id = "notification";
        notif.className = "notification";
        document.body.appendChild(notif);
    }

    notif.textContent = message;
    notif.classList.add("show");

    setTimeout(() => {
        notif.classList.remove("show");
    }, 1200);
}

// 🔽 Загрузка информации о товаре
function loadProduct(id) {
    fetch(`https://marketsolution.onrender.com/product/item/get?id=${id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("product-name").textContent = data.name;

            let priceElem = document.createElement("div");
            priceElem.id = "product-price";
            priceElem.textContent = data.price ? `${data.price} $` : "The price is not specified";
            document.getElementById("product-info").insertBefore(priceElem, document.getElementById("product-type"));

            document.getElementById("product-type").textContent = data.type;

            const img = document.getElementById("product-image");
            if (data.ico) {
                img.src = "https://marketsolution.onrender.com" + data.ico;
                img.style.display = "block";
            } else {
                img.style.display = "none";
            }

            const specsDiv = document.getElementById("product-specifications");
            specsDiv.innerHTML = "";
            if (data.specifications) {
                const specsArr = data.specifications.split(';').filter(s => s.trim() !== '');
                const ul = document.createElement("ul");
                specsArr.forEach(spec => {
                    const li = document.createElement("li");
                    li.textContent = spec.trim();
                    ul.appendChild(li);
                });
                specsDiv.appendChild(ul);
            }
        })
        .catch(err => console.error("Error when adding:", err));
}
