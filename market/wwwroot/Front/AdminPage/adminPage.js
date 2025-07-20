document.addEventListener("DOMContentLoaded", () => {
    // Привязка logout к кнопке "logout"
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    const homeBtn = document.getElementById("home-btn");
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            setTimeout(() => {
                window.location.href = "/Front/Main/main.html";
            }, 100);
        });
    }

    fetch("/admin/user/get", {
        method: "GET",
        credentials: "include", // Куки обязательны для определения админа
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("The server returned an error");
            }
            return res.json();
        })
        .then(data => {
            if (data.message) {
                alert(data.message); // не админ
                window.location.href = "/"; // редиректим на главную
                return;
            }

            // Показываем ник админа
            const admin = data.admin;
            document.getElementById("admin-name").textContent = admin.login || "Admin";

            // Рендерим таблицу пользователей
            const users = data.users || data.db?.users || [];
            renderUsers(users);

            // Загружаем товары
            fetchItems();

            // Загружаем заявки
            fetchRequests();
        })
        .catch(error => {
            console.error("Error when receiving data:", error);
            alert("Error when receiving the administrator's data.");
        });
});

function renderUsers(users) {
    const container = document.getElementById("user-table");

    if (!Array.isArray(users) || users.length === 0) {
        container.innerHTML = "<p>Users not found</p>";
        return;
    }

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["ID", "Login", "Email", "Role", "Password", "Actions"].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    users.forEach(user => {
        const row = document.createElement("tr");

        ["id", "login", "email", "role", "password"].forEach(field => {
            const td = document.createElement("td");
            td.textContent = user[field] ?? "";
            row.appendChild(td);
        });

        const actionsTd = document.createElement("td");

        // Кнопка редактирования
        const editBtn = document.createElement("button");
        editBtn.textContent = "Update";
        editBtn.className = "edit-btn";
        editBtn.onclick = () => openEditModal(user);
        actionsTd.appendChild(editBtn);

        // Кнопка удаления
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "remove-btn";
        deleteBtn.onclick = () => openDeleteModal(user.id);
        actionsTd.appendChild(deleteBtn);

        row.appendChild(actionsTd);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.innerHTML = "";
    container.appendChild(table);
}

function fetchItems() {
    fetch("/admin/item/get", {
        method: "GET",
        credentials: "include"
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("error on receipt of goods");
            }
            return res.json();
        })
        .then(items => {
            renderItems(items);
        })
        .catch(err => {
            console.error("Error loading the goods.", err);
            const container = document.getElementById("product-table");
            container.innerHTML = "<p>Error loading the goods.</p>";
        });
}

function renderItems(items) {
    const container = document.getElementById("product-table");

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = "<p>No products were found.</p>";
        return;
    }

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["ID", "Name", "Type", "Price", "Quantity", "Brand", "Actions"].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    items.forEach(item => {
        const row = document.createElement("tr");

        ["id", "name", "type", "price", "quantity", "brand"].forEach(field => {
            const td = document.createElement("td");
            if (field === "price") {
                td.textContent = (item[field] !== undefined && item[field] !== null) ? item[field] + "$" : "";
            } else {
                td.textContent = item[field] ?? "";
            }
            row.appendChild(td);
        });

        // Колонка с кнопками удаления и обновления
        const actionsTd = document.createElement("td");

        // Кнопка удаления
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "remove-btn";
        removeBtn.onclick = () => {
            if (confirm(`Are you sure you want to remove the product "${item.name}"?`)) {
                fetch(`/admin/item/remove?itemId=${item.id}`, {
                    method: "DELETE",
                    credentials: "include"
                })
                    .then(res => {
                        if (!res.ok) throw new Error("Failed to remove item");
                        return res.json();
                    })
                    .then(() => {
                        fetchItems();
                    })
                    .catch(err => {
                        alert("Error removing item: " + err.message);
                    });
            }
        };
        actionsTd.appendChild(removeBtn);

        // Кнопка обновления
        const updateBtn = document.createElement("button");
        updateBtn.textContent = "Update";
        updateBtn.className = "edit-btn";
        updateBtn.onclick = () => openUpdateModal(item);
        actionsTd.appendChild(updateBtn);

        row.appendChild(actionsTd);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.innerHTML = "";
    container.appendChild(table);
}




function fetchRequests() {
    fetch("/admin/request/get", {
        method: "GET",
        credentials: "include"
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Error fetching requests");
            }
            return res.json();
        })
        .then(requests => {
            renderRequests(requests);
        })
        .catch(err => {
            console.error("Error loading requests.", err);
            const container = document.getElementById("order-table");
            container.innerHTML = "<p>Error loading requests.</p>";
        });
}

function getStatusText(status) {
    switch (status) {
        case 0:
            return 'Open';
        case 1:
            return 'Progress';
        case 2:
            return 'Closed';
        default:
            return 'Unknown';
    }
}

function renderRequests(requests) {
    const requestTable = document.getElementById('request-table');
    if (!requestTable) return;

    if (requests.length === 0) {
        requestTable.innerHTML = '<p>No requests found.</p>';
        return;
    }

    let html = `
<table>
  <thead>
    <tr>
      <th>User ID</th>
      <th>Message</th>
      <th>Reply</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
`;


    requests.forEach(r => {
        html += `
    <tr>
      <td>${r.userId}</td>
      <td>${r.message}</td>
      <td>${r.reply ?? '-'}</td>
      <td>${getStatusText(r.status)}</td>
      <td>
        <button class="reply-btn" data-request-id="${r.id}" data-status="${r.status}" data-reply="${r.reply ?? ''}">Reply</button>
      </td>
    </tr>
  `;
    });


    html += '</tbody></table>';
    requestTable.innerHTML = html;

    // Привязываем обработчики ко всем кнопкам Reply
    document.querySelectorAll(".reply-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const requestId = btn.getAttribute("data-request-id");
            const existingReply = btn.getAttribute("data-reply");
            const existingStatus = btn.getAttribute("data-status");

            document.getElementById("reply-text").value = existingReply || "";
            document.getElementById("status-select").value = existingStatus || "0";
            document.getElementById("reply-modal").style.display = "flex";
            document.getElementById("send-reply-btn").setAttribute("data-request-id", requestId);
        });
    });
}




function logout() {
    localStorage.removeItem("userId");

    document.cookie = "UserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";

    setTimeout(() => {
        window.location.href = "/Front/LogIn/logIn.html";
    }, 100);
}

function openEditModal(user) {
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-login").value = user.login;
    document.getElementById("edit-email").value = user.email;
    document.getElementById("edit-password").value = user.password;
    document.getElementById("edit-role").value = user.role;

    document.getElementById("edit-modal").style.display = "flex";
}

document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    document.getElementById("edit-modal").style.display = "none";
});

document.getElementById("save-user-btn").addEventListener("click", () => {
    const id = document.getElementById("edit-user-id").value;
    const login = document.getElementById("edit-login").value;
    const email = document.getElementById("edit-email").value;
    const password = document.getElementById("edit-password").value;
    const role = document.getElementById("edit-role").value;

    // Добавим элемент для вывода ошибки (предполагаем, что он уже есть в HTML)
    const errorMessage = document.getElementById("edit-error-message");

    // Очистим предыдущее сообщение об ошибке
    if (errorMessage) errorMessage.textContent = "";

    // Проверка длины пароля
    if (password.length < 8) {
        if (errorMessage) {
            errorMessage.textContent = "Password must be at least 8 characters long";
        } else {
            alert("Password must be at least 8 characters long");
        }
        return;
    }

    fetch(`/admin/user/update?UserId=${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, email, password, role })
    })
        .then(res => {
            if (!res.ok) throw new Error("Error when updating the user");
            return res.json();
        })
        .then(() => {
            document.getElementById("edit-modal").style.display = "none";
            location.reload();
        })
        .catch(err => {
            alert("Ошибка: " + err.message);
        });
});


let userIdToDelete = null;

function openDeleteModal(userId) {
    userIdToDelete = userId;
    document.getElementById("confirm-delete-modal").style.display = "flex";
}

document.getElementById("cancel-delete-btn").addEventListener("click", () => {
    userIdToDelete = null;
    document.getElementById("confirm-delete-modal").style.display = "none";
});

document.getElementById("confirm-delete-btn").addEventListener("click", () => {
    if (!userIdToDelete) return;

    fetch(`/admin/user/remove?UserId=${userIdToDelete}`, {
        method: "DELETE",
        credentials: "include",
    })
        .then(res => {
            if (!res.ok) throw new Error("Error when deleting the user");
            return res.json();
        })
        .then(() => {
            userIdToDelete = null;
            document.getElementById("confirm-delete-modal").style.display = "none";
            location.reload();
        })
        .catch(err => {
            alert("Error deleting user: " + err.message);
        });
});




document.querySelector(".admin-controls .action-btn").addEventListener("click", () => {
    document.getElementById("add-product-modal").style.display = "flex";
});

document.getElementById("cancel-product-btn").addEventListener("click", () => {
    document.getElementById("add-product-modal").style.display = "none";
});



document.getElementById("submit-product-btn").addEventListener("click", () => {
    const name = document.getElementById("product-name").value.trim();
    const type = document.getElementById("product-type").value.trim();
    const price = parseFloat(document.getElementById("product-price").value);
    const quantity = parseInt(document.getElementById("product-quantity").value);
    const brand = document.getElementById("product-brand").value.trim();
    const ico = document.getElementById("product-ico").value.trim(); // <-- новое поле
    const specifications = document.getElementById("product-specification").value.trim();

    if (!name || !type || isNaN(price) || isNaN(quantity) || !brand || !ico ||  !specifications) {
        alert("Please fill all fields correctly, including icon URL.");
        return;
    }

    const newItem = { name, type, price, quantity, brand, ico, specifications }; // <-- добавляем ico

    fetch("/admin/item/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(newItem)
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to add item");
            return res.json();
        })
        .then(() => {
            document.getElementById("add-product-modal").style.display = "none";
            fetchItems(); // reload item list
        })
        .catch(err => {
            alert("Error adding item: " + err.message);
        });
});



function openUpdateModal(item) {
    document.getElementById("update-product-id").value = item.id;
    document.getElementById("update-product-name").value = item.name || "";
    document.getElementById("update-product-type").value = item.type || "";
    document.getElementById("update-product-price").value = item.price || 0;
    document.getElementById("update-product-quantity").value = item.quantity || 0;
    document.getElementById("update-product-brand").value = item.brand || "";
    document.getElementById("update-product-ico").value = item.ico || "";
    document.getElementById("update-product-specifications").value = item.specifications || "";

    document.getElementById("update-product-modal").style.display = "flex";
}

document.getElementById("cancel-update-product-btn").addEventListener("click", () => {
    document.getElementById("update-product-modal").style.display = "none";
});

document.getElementById("save-update-product-btn").addEventListener("click", () => {
    const id = document.getElementById("update-product-id").value;
    const name = document.getElementById("update-product-name").value.trim();
    const type = document.getElementById("update-product-type").value.trim();
    const price = parseFloat(document.getElementById("update-product-price").value);
    const quantity = parseInt(document.getElementById("update-product-quantity").value);
    const brand = document.getElementById("update-product-brand").value.trim();
    const ico = document.getElementById("update-product-ico").value.trim();
    const specifications = document.getElementById("update-product-specifications").value.trim();

    if (!name || !type || isNaN(price) || isNaN(quantity) || !brand || !ico || !specifications) {
        alert("Please fill all fields correctly.");
        return;
    }

    const updatedItem = { name, type, price, quantity, brand, ico, specifications };

    fetch(`/admin/item/update?itemId=${id}`, {
        method: "PUT",  // Рекомендуется использовать PUT вместо UPDATE
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(updatedItem)
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to update item");
            return res.json();
        })
        .then(() => {
            document.getElementById("update-product-modal").style.display = "none";
            fetchItems();  // Обновляем список товаров
        })
        .catch(err => {
            alert("Error updating item: " + err.message);
        });
});




document.getElementById("cancel-reply-btn").addEventListener("click", () => {
    document.getElementById("reply-modal").style.display = "none";
});

document.getElementById("send-reply-btn").addEventListener("click", () => {
    const requestId = document.getElementById("send-reply-btn").getAttribute("data-request-id");
    const reply = document.getElementById("reply-text").value.trim();
    const status = parseInt(document.getElementById("status-select").value);

    if (!reply || isNaN(status)) {
        alert("Fill all fields correctly.");
        return;
    }

    fetch(`/admin/request/updateReply?RequestId=${requestId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reply, status })
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to send reply.");
            return res.json();
        })
        .then(() => {
            document.getElementById("reply-modal").style.display = "none";
            fetchRequests(); // перерисуем заявки
        })
        .catch(err => {
            alert("Error: " + err.message);
        });
});






// Открытие формы загрузки картинок
// Переключение на форму загрузки
document.getElementById("toggle-upload-section-btn").addEventListener("click", () => {
    document.getElementById("product-form-section").style.display = "none";
    document.getElementById("image-upload-section").style.display = "flex";
});

// Назад к форме товара
document.getElementById("back-to-form-btn").addEventListener("click", () => {
    document.getElementById("image-upload-section").style.display = "none";
    document.getElementById("product-form-section").style.display = "block";
    document.getElementById("upload-status").innerText = "";
});



// Загрузка изображений
document.getElementById("upload-images-btn").addEventListener("click", () => {
    const fileInputs = document.querySelectorAll(".image-file");
    const formData = new FormData();
    let totalFiles = 0;

    fileInputs.forEach((input) => {
        if (input.files.length > 0) {
            for (const file of input.files) {
                formData.append("files", file);
                totalFiles++;
            }
        }
    });

    if (totalFiles === 0) {
        alert("Please select at least one image.");
        return;
    }

    if (totalFiles > 5) {
        alert("You can upload a maximum of 5 images.");
        return;
    }

    fetch("/admin/img/add", {
        method: "POST",
        body: formData,
        credentials: "include"
    })
        .then(res => {
            if (!res.ok) throw new Error("Upload failed.");
            return res.json();
        })
        .then(data => {
            document.getElementById("upload-status").innerText = "Upload successful.";

            // ✅ Очистка всех полей
            fileInputs.forEach(input => {
                input.value = ""; // Очистить выбранные файлы
            });

            // ✅ Если есть превью — удалить (если используешь)
            const previewContainer = document.getElementById("preview-container");
            if (previewContainer) {
                previewContainer.innerHTML = "";
            }
        })
        .catch(err => {
            document.getElementById("upload-status").innerText = "Error: " + err.message;
        });
});



document.querySelectorAll('.image-file').forEach(input => {
    input.addEventListener('change', function () {
        const fileNameSpan = this.closest('.file-upload-wrapper').querySelector('.file-name');
        if (this.files.length > 0) {
            fileNameSpan.textContent = this.files[0].name;
        } else {
            fileNameSpan.textContent = "Файл не выбран";
        }
    });
});
