// ─── Keys ────────────────────────────────────────────────────
const USER_KEY = "bitenow_user";

// ─── Save user after login / signup ──────────────────────────
function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ─── Get logged-in user ───────────────────────────────────────
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

// ─── Guards ───────────────────────────────────────────────────
function requireLogin(redirectTo = "login.html") {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
  }
}

function requireAdmin(redirectTo = "../index.html") {
  if (!isAdmin()) {
    alert("Access denied. Admins only.");
    window.location.href = redirectTo;
  }
}

// ─────────────────────────────────────────────────────────────
// ⭐ ADDED FEATURES (PROFILE + ORDERS SUPPORT)
// ─────────────────────────────────────────────────────────────

// 📍 Get user location
function getUserLocation() {
  const user = getUser();
  return user?.location || null;
}

// 📞 Get user phone number (NEW)
function getUserPhone() {
  const user = getUser();
  return user?.phone || null;
}

// 👤 Get user id safely
function getUserId() {
  const user = getUser();
  return user?.id || null;
}

// ✏️ Update user locally (for profile edits later)
function updateUser(updatedFields) {
  const user = getUser();
  if (!user) return;

  const newUser = { ...user, ...updatedFields };
  saveUser(newUser);
}

// 🚪 Safe logout
function safeLogout() {
  logoutUser();
  window.location.href = "index.html";
}