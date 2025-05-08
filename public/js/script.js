document.addEventListener("DOMContentLoaded", function () {
  const email = localStorage.getItem("userEmail");

  if (email) {
    fetch(`https://incontri-backend.onrender.com/profile-data?email=${email}`)
      .then(response => response.json())
      .then(data => {
        localStorage.setItem("isAdmin", data.email === "admin@example.com" ? "true" : "false");
      })
      .catch(() => {
        console.log("Errore nel recupero del profilo");
      });
  }
});
