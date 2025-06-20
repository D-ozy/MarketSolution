document.addEventListener("DOMContentLoaded", async () => {
    const profileLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");

    // Если userId есть, получаем пользователя
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

    // Получаем все товары
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
    } catch (err) {
        console.error("Ошибка при получении товаров:", err);
    }
});
