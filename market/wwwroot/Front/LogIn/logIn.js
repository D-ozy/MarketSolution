document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#loginForm");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMessage.textContent = "";
        successMessage.textContent = "";

        const loginOrEmail = document.getElementById("loginOrEmail").value;
        const password = document.getElementById("password").value;

        const body = JSON.stringify({
            login: loginOrEmail,
            email: loginOrEmail,
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
                successMessage.textContent = `Welcome, ${user.login || user.email}!`;
                localStorage.setItem("userId", user.id);

                setTimeout(() => {
                    window.location.href = "/Front/Home/home.html";
                }, 1000);
            } else {
                const error = await response.json();
                errorMessage.textContent = error.message || "Incorrect login or password.";
            }
        } catch (err) {
            console.error("Login error:", err);
            errorMessage.textContent = "An error occurred. Please try again later.";
        }
    });
});
