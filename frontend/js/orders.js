// ── Guard: must be logged in ──────────────────────────────────
requireLogin("login.html");


// ── Toast ─────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ── Status badge helper ───────────────────────────────────────
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

// ── Format date ───────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Toggle expand/collapse a single order card ────────────────
function toggleOrder(orderId) {
  const body     = document.getElementById(`body-${orderId}`);
  const chevron  = document.getElementById(`chevron-${orderId}`);
  const isOpen   = body.classList.contains("open");

  body.classList.toggle("open",    !isOpen);
  chevron.classList.toggle("open", !isOpen);

  // Lazy-load detail if not yet fetched
  if (!isOpen && body.dataset.loaded !== "true") {
    loadOrderDetail(orderId);
  }
}

// ── Fetch full order detail and inject into expanded body ─────
async function loadOrderDetail(orderId) {
  const body = document.getElementById(`body-${orderId}`);
  body.innerHTML = `<div class="spinner" style="margin:1.5rem auto"></div>`;

  const { ok, data } = await api.get(`/api/orders/${orderId}`);

  if (!ok) {
    body.innerHTML = `<p style="color:var(--danger)">Failed to load order details.</p>`;
    return;
  }

  // ── Item rows ──────────────────────────────────────────
  const itemsHtml = data.items.map(item => `
    <div class="order-item-row">
      <span class="order-item-name">${item.menuItemName}</span>
      <span class="order-item-qty">× ${item.quantity}</span>
      <span class="order-item-line">$${item.lineTotal.toFixed(2)}</span>
    </div>
  `).join("");

  // ── Notes ──────────────────────────────────────────────
  const notesHtml = data.notes
    ? `<div class="order-notes">
         <strong>📝 Notes:</strong> ${data.notes}
       </div>`
    : "";

  // ── Cancel button (only for Pending / Confirmed) ───────
  const canCancel = data.status === "Pending" || data.status === "Confirmed";
  const actionsHtml = canCancel
    ? `<div class="order-actions">
         <button
           class="btn btn-danger btn-sm"
           onclick="handleCancel(${orderId})"
           id="cancel-btn-${orderId}"
         >
           Cancel Order
         </button>
       </div>`
    : "";

  body.innerHTML = `${itemsHtml}${notesHtml}${actionsHtml}`;
  body.dataset.loaded = "true";
}

// ── Cancel order ──────────────────────────────────────────────
async function handleCancel(orderId) {
  const btn = document.getElementById(`cancel-btn-${orderId}`);
  if (!confirm("Are you sure you want to cancel this order?")) return;

  btn.disabled    = true;
  btn.textContent = "Cancelling...";

  // DELETE /api/orders/{id} sets status to Cancelled
  const { ok, data } = await api.delete(`/api/orders/${orderId}`);

  if (ok) {
    showToast("Order cancelled successfully.");
    // Reload the full list to reflect the new status
    loadOrders();
  } else {
    const msg = typeof data === "string"
      ? data
      : data?.message ?? "Could not cancel order.";
    showToast(`❌ ${msg}`);
    btn.disabled    = false;
    btn.textContent = "Cancel Order";
  }
}

// ── Render all order summary cards ────────────────────────────
function renderOrders(orders) {
  const container = document.getElementById("orders-container");

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="orders-empty">
        <div class="orders-empty-icon">📋</div>
        <h2>No orders yet</h2>
        <p>Looks like you haven't ordered anything yet.</p>
        <a href="menu.html" class="btn btn-primary" style="margin-top:1.2rem">
          Browse Menu
        </a>
      </div>`;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-card">

      <!-- Always-visible header — click to expand -->
      <div class="order-card-header" onclick="toggleOrder(${order.id})">
        <div class="order-meta">
          <span class="order-id">Order #${order.id}</span>
          <span class="order-date">${formatDate(order.placedAt)}</span>
        </div>

        <div class="order-card-right">
          <span class="order-items-count">
            ${order.itemCount} item${order.itemCount !== 1 ? "s" : ""}
          </span>
          <span class="order-total">$${order.totalAmount.toFixed(2)}</span>
          ${statusBadge(order.status)}
          <span class="order-chevron" id="chevron-${order.id}">▼</span>
        </div>
      </div>

      <!-- Expandable detail body -->
      <div class="order-card-body" id="body-${order.id}">
        <!-- Loaded lazily on first expand -->
      </div>

    </div>
  `).join("");
}

// ── Fetch orders for logged-in user ───────────────────────────
async function loadOrders() {
  const user      = getUser();
  const container = document.getElementById("orders-container");
  container.innerHTML = `<div class="spinner"></div>`;

  const { ok, data } = await api.get(`/api/orders/user/${user.id}`);

  if (!ok) {
    container.innerHTML = `
      <div class="orders-empty">
        <div class="orders-empty-icon">⚠️</div>
        <h2>Failed to load orders</h2>
        <p>Please try refreshing the page.</p>
      </div>`;
    return;
  }

  renderOrders(data);
}

// ── Init ──────────────────────────────────────────────────────
renderNav();
loadOrders();