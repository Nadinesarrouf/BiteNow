// ── Paths are relative to admin/ subfolder ────────────────────
// so we go up one level with ../ to reach root files
// Scripts load order in each admin HTML:
// ../../js/api.js → ../../js/auth.js → admin-common.js → page.js

// ── Guard: must be logged in AND be Admin ─────────────────────
(function adminGuard() {
  const user = getUser();
  if (!user) {
    window.location.href = "../login.html";
    return;
  }
  if (user.role !== "Admin") {
    alert("Access denied. Admins only.");
    window.location.href = "../index.html";
  }
})();

// ── Shared toast ──────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ── Shared status badge ───────────────────────────────────────
function statusBadge(status) {
  const cls = {
    Pending:   "badge-pending",
    Confirmed: "badge-confirmed",
    Preparing: "badge-preparing",
    Ready:     "badge-ready",
    Delivered: "badge-delivered",
    Cancelled: "badge-cancelled",
  }[status] ?? "badge-pending";
  return `<span class="badge ${cls}">${status}</span>`;
}

// ── Shared date formatter ─────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Render the top navbar ─────────────────────────────────────
function renderAdminNav() {
  const nav  = document.getElementById("nav-links");
  const user = getUser();
  if (!nav || !user) return;

  nav.innerHTML = `
    <a href="../index.html">🍔 Customer View</a>
    <span style="color:var(--muted);font-size:0.9rem">Hi, ${user.name}</span>
    <button class="btn btn-outline btn-sm" onclick="adminLogout()">Logout</button>
  `;
}

function adminLogout() {
  logoutUser();
  window.location.href = "../login.html";
}