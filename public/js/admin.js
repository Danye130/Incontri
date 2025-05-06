document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  if (!userId) return alert("Accesso negato (non loggato)");

  fetch("/admin/users", {
    headers: {
      "x-user-id": userId
    }
  })
    .then(res => res.json())
    .then(users => {
      const tbody = document.getElementById("userTable");
      tbody.innerHTML = "";

      users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user.nickname}</td>
          <td>${user.email}</td>
          <td>
            <select onchange="cambiaRuolo('${user._id}', this.value)">
              <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
              <option value="creator" ${user.role === "creator" ? "selected" : ""}>Creator</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
            </select>
          </td>
          <td>
            <input type="checkbox" onchange="toggleFeatured('${user._id}', this.checked)" ${user.isFeatured ? "checked" : ""}>
          </td>
          <td>
            <button onclick="eliminaUtente('${user._id}')">Elimina</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      alert("Errore nel caricamento utenti");
      console.error(err);
    });
});

function cambiaRuolo(userId, nuovoRuolo) {
  fetch(`/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": localStorage.getItem("userId")
    },
    body: JSON.stringify({ role: nuovoRuolo })
  }).then(() => location.reload());
}

function toggleFeatured(userId, isFeatured) {
  fetch(`/admin/users/${userId}/featured`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": localStorage.getItem("userId")
    },
    body: JSON.stringify({ isFeatured })
  });
}

function eliminaUtente(userId) {
  if (!confirm("Vuoi davvero eliminare questo utente?")) return;

  fetch(`/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": localStorage.getItem("userId")
    }
  }).then(() => location.reload());
}
