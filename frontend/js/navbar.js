// ── Shared navbar renderer for all CUSTOMER pages ─────────────
// Include this after auth.js and cart.js on every customer page

function renderNav() {
  const nav   = document.getElementById("nav-links");
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
      ${isCustomer() ? `<a href="orders.html">My Orders</a>` : ""}
      ${isAdmin()    ? `<a href="admin/dashboard.html">⚙️ Admin</a>` : ""}
      <span style="color:var(--muted);font-size:0.9rem">
        Hi, ${user.name}
      </span>
      <button class="btn btn-outline btn-sm" onclick="handleLogout()">
        Logout
      </button>
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