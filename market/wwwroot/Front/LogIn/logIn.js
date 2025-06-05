document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const loginOrEmail = document.getElementById("loginOrEmail").value;
        const password = document.getElementById("password").value;

        const body = JSON.stringify({
            login: loginOrEmail, // будем использовать это поле как login/email
            email: loginOrEmail, // чтобы сервер смог проверить и по email
            password: password
        });

        try {
            const response = await fetch("/logIn/user/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: body
            });

            if (response.ok) {
                const user = await response.json();
                alert(`Пользователь найден: ${user.login || user.email}`);

                // Можно сохранить ID, если нужно
                localStorage.setItem("userId", user.id);

                // Переход на главную страницу
                window.location.href = "/Front/Home/home.html"; // <-- измени путь при необходимости
            } else {
                const error = await response.json();
                alert(error.message || "Неверный логин или пароль.");
            }
        } catch (err) {
            console.error("Ошибка входа:", err);
            alert("Произошла ошибка. Попробуйте позже.");
        }
    });
});