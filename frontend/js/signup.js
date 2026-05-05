// ── Redirect if already logged in ────────────────────────────
if (isLoggedIn()) {
  window.location.href = "menu.html";
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
async function handleSignup() {
  const name            = document.getElementById("name").value.trim();
  const email           = document.getElementById("email").value.trim();
  const password        = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const btn             = document.getElementById("signup-btn");

  // ── Client-side validation ──────────────────────────────
  if (!name || !email || !password || !confirmPassword) {
    showError("Please fill in all fields.");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  // ── Call API ────────────────────────────────────────────
  btn.disabled = true;
  btn.textContent = "Creating account...";

  const { ok, data } = await api.post("/api/auth/signup", { name, email, password });

  if (ok) {
    // Save user to localStorage (same shape as login response)
    saveUser({
      id:    data.id,
      name:  data.name,
      email: data.email,
      role:  data.role
    });

    showSuccess("Account created! Redirecting to menu...");

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 1000);

  } else {
    // Backend returns a string error message
    const msg = typeof data === "string"
      ? data
      : data?.message ?? data?.title ?? "Signup failed. Please try again.";
    showError(msg);
    btn.disabled = false;
    btn.textContent = "Create Account";
  }
}

// ── Allow Enter key to submit ─────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSignup();
});