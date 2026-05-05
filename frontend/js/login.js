// ── Redirect if already logged in ────────────────────────────
if (isLoggedIn()) {
  window.location.href = isAdmin() ? "admin/dashboard.html" : "menu.html";
}

// ── Helpers ───────────────────────────────────────────────────
function showError(msg) {
  const el = document.getElementById("error-msg");
  el.textContent = msg;
  el.classList.add("show");
  document.getElementById("success-msg").classList.remove("show");
}

function showSuccess(msg) {
  const el = document.getElementById("success-msg");
  el.textContent = msg;
  el.classList.add("show");
  document.getElementById("error-msg").classList.remove("show");
}

// ── Main handler ──────────────────────────────────────────────
async function handleLogin() {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const btn      = document.getElementById("login-btn");

  // ── Client-side validation ──────────────────────────────
  if (!email || !password) {
    showError("Please enter your email and password.");
    return;
  }

  // ── Call API ────────────────────────────────────────────
  btn.disabled = true;
  btn.textContent = "Logging in...";

  const { ok, data } = await api.post("/api/auth/login", { email, password });

  if (ok) {
    saveUser({
      id:    data.id,
      name:  data.name,
      email: data.email,
      role:  data.role
    });

    showSuccess("Login successful! Redirecting...");

    setTimeout(() => {
      // Admins go to admin dashboard, customers go to menu
      if (data.role === "Admin") {
        window.location.href = "admin/dashboard.html";
      } else {
        window.location.href = "menu.html";
      }
    }, 800);

  } else {
    const msg = typeof data === "string"
      ? data
      : data?.message ?? data?.title ?? "Invalid email or password.";
    showError(msg);
    btn.disabled = false;
    btn.textContent = "Login";
  }
}

// ── Allow Enter key to submit ─────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});