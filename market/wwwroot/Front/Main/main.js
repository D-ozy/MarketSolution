document.addEventListener("DOMContentLoaded", async () => {
    const profileLink = document.querySelector(".profile-icon a");
    const userId = localStorage.getItem("userId");

    if (!userId) return;

    try {
        const response = await fetch("/main/user/get", {
            method: "GET",
            headers: {
                "X-User-Id": userId
            }
        });

        if (!response.ok) return;

        const user = await response.json();

        if (user && user.login) {
            profileLink.textContent = user.login;
        }
    } catch (err) {
        console.error("Ошибка при получении пользователя:", err);
    }
});