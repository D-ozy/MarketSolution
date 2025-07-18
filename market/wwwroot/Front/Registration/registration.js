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

    // 🔒 Проверка: длина пароля
    if (password.value.length < 8) {
        errorMessage.textContent = "Password must be at least 8 characters long";
        return;
    }

    // 🔐 Проверка: совпадение паролей
    if (password.value !== confirmPassword.value) {
        errorMessage.textContent = "Passwords don't match";
        return;
    }

    const user = {
        login: document.getElementById('login').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: password.value
    };

    try {
        const registeredUser = await registerUser(user);
        successMessage.textContent = "Registration succeeded!";
        form.reset();
    } catch (error) {
        console.error("Registration mistake", error);
        errorMessage.textContent = error.message;
    }
});

async function registerUser(userData) {
    const response = await fetch("https://marketsolution.onrender.com/registration/user/add", {
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
        throw new Error("Error parsing the server response");
    }

    if (!response.ok) {
        throw new Error(data.message || "Error during user registration");
    }

    return data;
}
