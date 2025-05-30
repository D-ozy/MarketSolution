const form = document.getElementById('registerForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (password.value !== confirmPassword.value) {
        errorMessage.textContent = "Passwords do not match";
        return;
    }

    errorMessage.textContent = "";

    const user = {
        login: document.getElementById('login').value,
        email: document.getElementById('email').value,
        password: password.value
    };

    try {
        const registeredUser = await registerUser(user);
        alert("Регистрация успешна! ID: " + registeredUser.id);
        // redirect, save to localStorage, etc.
    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Ошибка при регистрации. Попробуйте снова.";
    }
});

async function registerUser(userData) {
    const response = await fetch("https://localhost:7067/registration/user/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error("Ошибка при регистрации пользователя");
    }

    return await response.json();
}

async function getUserById(userId) {
    const response = await fetch(`https://localhost:7067/registration/user/get?id=${encodeURIComponent(userId)}`);

    if (!response.ok) {
        throw new Error("Пользователь не найден");
    }

    return await response.json();
}