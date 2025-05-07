document.addEventListener('DOMContentLoaded', function() {
  const email = localStorage.getItem("userEmail");

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const profileBtn = document.getElementById("profileBtn");
  const usersBtn = document.getElementById("usersBtn");
  const messagesBtn = document.getElementById("messagesBtn");
  const likesBtn = document.getElementById("likesBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const msgAlert = document.getElementById("msg-alert");

  if (email) {
    signupBtn.classList.add("hidden");
    loginBtn.classList.add("hidden");
    profileBtn.classList.remove("hidden");
    usersBtn.classList.remove("hidden");
    messagesBtn.classList.remove("hidden");
    likesBtn.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");

    checkUnreadMessages();
    setInterval(checkUnreadMessages, 5000);
  }

  function checkUnreadMessages() {
    fetch(`https://incontri-backend.onrender.com/unread-messages?receiver=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.count > 0) {
          msgAlert.style.display = "inline";
        } else {
          msgAlert.style.display = "none";
        }
      })
      .catch(err => console.error("Errore controllo messaggi:", err));
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.reload();
  });

  messagesBtn.addEventListener("click", () => {
    window.location.href = "messaggi.html";
  });

  likesBtn.addEventListener("click", () => {
    window.location.href = "likes.html";
  });
});
