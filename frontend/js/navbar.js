// ── Shared navbar renderer for all CUSTOMER pages ─────────────
function renderNav() {
  const nav = document.getElementById("nav-links");
  if (!nav) return;

  const user  = getUser();
  const count = getCartCount();
  const cartLabel = count > 0
    ? `🛒 Cart <span class="cart-badge">${count}</span>`
    : "🛒 Cart";

  if (user) {
    nav.innerHTML = `
      <a href="menu.html">Menu</a>
      <a href="cart.html">${cartLabel}</a>
      <a href="profile.html">Profile</a>
      ${isCustomer() ? `<a href="orders.html">My Orders</a>` : ""}
      ${isAdmin()    ? `<a href="admin/dashboard.html">⚙️ Admin</a>` : ""}
      <span style="color:var(--muted);font-size:0.9rem">Hi, ${user.name}</span>
      <button type="button" class="btn btn-outline btn-sm" onclick="handleLogout()">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="menu.html">Menu</a>
      <a href="cart.html">${cartLabel}</a>
      <a href="login.html">Login</a>
      <a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>
    `;
  }
}

function handleLogout() {
  logoutUser();
  window.location.href = "index.html";
}