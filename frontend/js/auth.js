// ─── Keys ────────────────────────────────────────────────────
const USER_KEY = "bitenow_user";

// ─── Save user after login / signup ──────────────────────────
function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ─── Get the currently logged-in user (or null) ───────────────
function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ─── Remove user on logout ───────────────────────────────────
function logoutUser() {
  localStorage.removeItem(USER_KEY);
}

// ─── Role checks ─────────────────────────────────────────────
function isLoggedIn() {
  return getUser() !== null;
}

function isAdmin() {
  const user = getUser();
  return user?.role === "Admin";
}

function isCustomer() {
  const user = getUser();
  return user?.role === "Customer";
}

// ─── Guard: redirect if not logged in ────────────────────────
function requireLogin(redirectTo = "login.html") {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
  }
}

// ─── Guard: redirect if not admin ────────────────────────────
function requireAdmin(redirectTo = "../index.html") {
  if (!isAdmin()) {
    alert("Access denied. Admins only.");
    window.location.href = redirectTo;
  }
}