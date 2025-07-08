document.addEventListener("DOMContentLoaded", () => {
    const profileLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");
    const buyNowBtn = document.getElementById("buy-now");

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get("id");

    // 🔽 Обработка перехода при клике на ник
    if (profileLink) {
        profileLink.addEventListener("click", (event) => {
            event.preventDefault();

            if (userId) {
                window.location.assign("/Front/Account/account.html");
            } else {
                window.location.assign("/Front/Login/login.html");
            }
        });

    }

    // 🔽 Показываем имя пользователя в header
    if (userId && profileLink) {
        fetch("https://localhost:7067/product/user/get", {
            method: "GET",
            credentials: "include" // Важно: отправляет куки
        })
            .then(res => res.json())
            .then(user => {
                if (user && user.login) {
                    profileLink.textContent = user.login;
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
                const res = await fetch(`https://localhost:7067/product/item/add?id=${itemId}`, {
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
    fetch(`https://localhost:7067/product/item/get?id=${id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("product-name").textContent = data.name;

            // 👇 Создаём и вставляем блок с ценой
            let priceElem = document.createElement("div");
            priceElem.id = "product-price";
            priceElem.textContent = data.price ? `${data.price} $` : "The price is not specified";
            document.getElementById("product-info").insertBefore(priceElem, document.getElementById("product-type"));

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
        .catch(err => console.error("Error when adding:", err));
}
