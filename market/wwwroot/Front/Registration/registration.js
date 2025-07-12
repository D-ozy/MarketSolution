const form = document.getElementById('registerForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Сброс сообщений
    errorMessage.textContent = "";
    successMessage.textContent = "";

    if (password.value !== confirmPassword.value) {
        errorMessage.textContent = "Пароли не совпадают";
        return;
    }

    const user = {
        login: document.getElementById('login').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: password.value
    };

    try {
        const registeredUser = await registerUser(user);
        successMessage.textContent = "Регистрация успешна!";
        form.reset();
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        errorMessage.textContent = error.message;
    }
});

async function registerUser(userData) {
    const response = await fetch("https://localhost:7210/registration/user/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error("Ошибка разбора ответа сервера");
    }

    if (!response.ok) {
        throw new Error(data.message || "Ошибка при регистрации пользователя");
    }

    return data;
}
