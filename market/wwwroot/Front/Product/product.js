document.addEventListener("DOMContentLoaded", () => {
    const profileLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");
    const buyNowBtn = document.getElementById("buy-now");

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get("id");

    // Показываем имя пользователя в header
    if (userId && profileLink) {
        fetch("https://localhost:7067/product/user/get", {
            method: "GET",
            credentials: "include" // Обязательно, чтобы cookie отправлялись
        })
            .then(res => res.json())
            .then(user => {
                if (user && user.login) {
                    profileLink.textContent = user.login;
                    profileLink.href = "#"; // Или ссылка на профиль
                }
            })
            .catch(err => console.error("Ошибка получения пользователя:", err));
    }

    // Загружаем товар
    if (itemId) {
        loadProduct(itemId);
    }

    // Обработка кнопки "Buy Now"
    if (buyNowBtn && itemId) {
        buyNowBtn.addEventListener("click", async () => {
            try {
                const res = await fetch(`https://localhost:7067/product/item/add?id=${itemId}`, {
                    method: "POST",
                    credentials: "include"
                });

                if (res.ok) {
                    showNotification("Товар добавлен в корзину");
                } else {
                    showNotification("Ошибка при добавлении");
                }
            } catch (err) {
                console.error("Ошибка при добавлении товара:", err);
                showNotification("Ошибка соединения");
            }
        });
    }
});

// Показ уведомления
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

// Загрузка информации о товаре
function loadProduct(id) {
    fetch(`https://localhost:7067/product/item/get?id=${id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("product-name").textContent = data.name;
            document.getElementById("product-type").textContent = data.type;

            const img = document.getElementById("product-image");
            if (data.ico) {
                img.src = "https://localhost:7067" + data.ico;
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
        .catch(err => console.error("Ошибка загрузки товара:", err));
}
