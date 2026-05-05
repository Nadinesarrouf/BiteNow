// ── State ─────────────────────────────────────────────────────
let allOrders      = [];
let activeStatus   = "All";

// ── Valid next-status transitions (mirrors backend exactly) ───
const TRANSITIONS = {
  Pending:   ["Confirmed", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Ready"],
  Ready:     ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

// ── Status pill colours ───────────────────────────────────────
const STATUS_LIST = [
  "All", "Pending", "Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"
];

// ── Init ──────────────────────────────────────────────────────
renderAdminNav();
loadOrders();

// ── Fetch all orders ──────────────────────────────────────────
async function loadOrders() {
  const wrap = document.getElementById("orders-wrap");
  wrap.innerHTML = `<div class="spinner" style="margin:2rem auto"></div>`;

  const { ok, data } = await api.get("/api/orders");

  if (!ok) {
    wrap.innerHTML = `
      <div class="empty" style="padding:3rem">
        <div class="empty-icon">⚠️</div>
        <p style="color:var(--danger)">Failed to load orders.</p>
      </div>`;
    return;
  }

  allOrders = data;
  renderStatusPills();
  applyFilters();
}

// ── Render status filter pills ────────────────────────────────
function renderStatusPills() {
  const container = document.getElementById("status-pills");

  // Count per status
  const counts = STATUS_LIST.reduce((acc, s) => {
    acc[s] = s === "All"
      ? allOrders.length
      : allOrders.filter(o => o.status === s).length;
    return acc;
  }, {});

  container.innerHTML = STATUS_LIST.map(s => `
    <button
      class="pill ${s === activeStatus ? "active" : ""}"
      onclick="selectStatus('${s}')"
    >
      ${s}
      <span style="
        background: ${s === activeStatus
          ? "rgba(255,255,255,0.3)"
          : "var(--border)"};
        color: ${s === activeStatus ? "#fff" : "var(--muted)"};
        border-radius: 99px;
        padding: 1px 7px;
        font-size: 0.75rem;
        margin-left: 4px;
        font-weight: 700;
      ">${counts[s]}</span>
    </button>
  `).join("");
}

// ── Select a status pill ──────────────────────────────────────
function selectStatus(status) {
  activeStatus = status;
  renderStatusPills();
  applyFilters();
}

// ── Apply status + search filters ────────────────────────────
function applyFilters() {
  const query = document.getElementById("search-input")
    .value.trim().toLowerCase();

  const filtered = allOrders.filter(order => {
    const matchStatus = activeStatus === "All"
      || order.status === activeStatus;
    const matchSearch = !query
      || String(order.id).includes(query)
      || (order.userName ?? "").toLowerCase().includes(query)
      || String(order.userId).includes(query);
    return matchStatus && matchSearch;
  });

  renderTable(filtered);
}

// ── Render orders table ───────────────────────────────────────
function renderTable(orders) {
  const wrap = document.getElementById("orders-wrap");

  if (orders.length === 0) {
    wrap.innerHTML = `
      <div class="empty" style="padding:3rem">
        <div class="empty-icon">📋</div>
        <p>No orders found.</p>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Placed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => {
            const nextSteps = TRANSITIONS[o.status] ?? [];
            return `
              <tr id="order-row-${o.id}">
                <td><strong>#${o.id}</strong></td>
                <td>
                  <div style="font-weight:600">
                    ${o.userName ?? `User #${o.userId}`}
                  </div>
                  <div style="font-size:0.78rem;color:var(--muted)">
                    ID: ${o.userId}
                  </div>
                </td>
                <td>${o.itemCount} item${o.itemCount !== 1 ? "s" : ""}</td>
                <td><strong>$${o.totalAmount.toFixed(2)}</strong></td>
                <td id="status-cell-${o.id}">
                  ${statusBadge(o.status)}
                </td>
                <td style="white-space:nowrap">
                  ${formatDate(o.placedAt)}
                </td>
                <td>
                  <div class="row-actions">
                    <!-- View detail button -->
                    <button
                      class="btn btn-outline btn-sm"
                      onclick="openDetailModal(${o.id})"
                    >🔍 View</button>

                    <!-- Dynamic next-step buttons -->
                    ${nextSteps.map(next => `
                      <button
                        class="btn btn-sm"
                        style="${nextBtnStyle(next)}"
                        onclick="handleStatusUpdate(${o.id}, '${next}')"
                        id="status-btn-${o.id}-${next}"
                      >
                        ${nextBtnLabel(next)}
                      </button>
                    `).join("")}
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>`;
}

// ── Button style per target status ───────────────────────────
function nextBtnStyle(status) {
  const styles = {
    Confirmed: "background:#cce5ff;color:#004085;border:1px solid #b8daff",
    Preparing: "background:#fff0d4;color:#8a5700;border:1px solid #ffd97d",
    Ready:     "background:#d4edda;color:#155724;border:1px solid #b1dfbb",
    Delivered: "background:#d1ecf1;color:#0c5460;border:1px solid #bee5eb",
    Cancelled: "background:#f8d7da;color:#721c24;border:1px solid #f5c6cb",
  };
  return styles[status] ?? "";
}

// ── Button label per target status ────────────────────────────
function nextBtnLabel(status) {
  const labels = {
    Confirmed: "✅ Confirm",
    Preparing: "👨‍🍳 Prepare",
    Ready:     "🔔 Ready",
    Delivered: "🚚 Delivered",
    Cancelled: "✕ Cancel",
  };
  return labels[status] ?? status;
}

// ─────────────────────────────────────────────────────────────
// STATUS UPDATE
// ─────────────────────────────────────────────────────────────

async function handleStatusUpdate(orderId, newStatus) {
  // Disable all action buttons for this row during update
  const row = document.getElementById(`order-row-${orderId}`);
  const btns = row?.querySelectorAll("button");
  btns?.forEach(b => { b.disabled = true; });

  // PATCH /api/orders/{id}/status
  const { ok, data } = await api.patch(
    `/api/orders/${orderId}/status`,
    { status: newStatus }
  );

  if (ok) {
    showToast(`Order #${orderId} → ${newStatus}`);
    // Reload full list to reflect new state + updated buttons
    await loadOrders();
  } else {
    const msg = typeof data === "string"
      ? data
      : data?.message ?? "Failed to update status.";
    showToast(`❌ ${msg}`);
    // Re-enable buttons on failure
    btns?.forEach(b => { b.disabled = false; });
  }
}

// ─────────────────────────────────────────────────────────────
// ORDER DETAIL MODAL
// ─────────────────────────────────────────────────────────────

async function openDetailModal(orderId) {
  document.getElementById("detail-modal-title").textContent =
    `Order #${orderId}`;
  document.getElementById("detail-modal-body").innerHTML =
    `<div class="spinner" style="margin:2rem auto"></div>`;
  document.getElementById("detail-modal").classList.add("open");

  // GET /api/orders/{id} for full detail including items
  const { ok, data } = await api.get(`/api/orders/${orderId}`);

  if (!ok) {
    document.getElementById("detail-modal-body").innerHTML =
      `<p style="color:var(--danger)">Failed to load order details.</p>`;
    return;
  }

  const nextSteps = TRANSITIONS[data.status] ?? [];

  document.getElementById("detail-modal-body").innerHTML = `

    <!-- Meta info grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;
                gap:0.8rem;margin-bottom:1.3rem">
      <div>
        <div style="font-size:0.75rem;font-weight:700;
                    text-transform:uppercase;color:var(--muted);
                    margin-bottom:2px">Customer</div>
        <div style="font-weight:600">${data.userName}</div>
        <div style="font-size:0.82rem;color:var(--muted)">
          ID: ${data.userId}
        </div>
      </div>
      <div>
        <div style="font-size:0.75rem;font-weight:700;
                    text-transform:uppercase;color:var(--muted);
                    margin-bottom:2px">Status</div>
        ${statusBadge(data.status)}
      </div>
      <div>
        <div style="font-size:0.75rem;font-weight:700;
                    text-transform:uppercase;color:var(--muted);
                    margin-bottom:2px">Placed</div>
        <div style="font-size:0.88rem">${formatDate(data.placedAt)}</div>
      </div>
      <div>
        <div style="font-size:0.75rem;font-weight:700;
                    text-transform:uppercase;color:var(--muted);
                    margin-bottom:2px">Last Updated</div>
        <div style="font-size:0.88rem">${formatDate(data.updatedAt)}</div>
      </div>
    </div>

    <!-- Items list -->
    <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;
                color:var(--muted);margin-bottom:0.5rem">
      Order Items
    </div>
    <div style="border:1px solid var(--border);border-radius:var(--radius);
                overflow:hidden;margin-bottom:1rem">
      ${data.items.map((item, i) => `
        <div style="display:flex;justify-content:space-between;
                    align-items:center;padding:0.65rem 1rem;
                    ${i < data.items.length - 1
                      ? "border-bottom:1px solid var(--border)" : ""}">
          <div>
            <span style="font-weight:600">${item.menuItemName}</span>
            <span style="color:var(--muted);font-size:0.85rem;
                          margin-left:0.5rem">× ${item.quantity}</span>
          </div>
          <div style="font-weight:700">$${item.lineTotal.toFixed(2)}</div>
        </div>
      `).join("")}

      <!-- Total row -->
      <div style="display:flex;justify-content:space-between;
                  align-items:center;padding:0.75rem 1rem;
                  background:var(--bg);border-top:2px solid var(--border)">
        <span style="font-weight:700">Total</span>
        <span style="font-weight:800;font-size:1.1rem">
          $${data.totalAmount.toFixed(2)}
        </span>
      </div>
    </div>

    <!-- Notes -->
    ${data.notes ? `
      <div style="background:var(--bg);border:1px solid var(--border);
                  border-radius:var(--radius);padding:0.7rem 1rem;
                  font-size:0.88rem;margin-bottom:1rem">
        <strong>📝 Notes:</strong> ${data.notes}
      </div>` : ""}

    <!-- Status action buttons -->
    ${nextSteps.length > 0 ? `
      <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;
                  color:var(--muted);margin-bottom:0.6rem">
        Update Status
      </div>
      <div style="display:flex;gap:0.7rem;flex-wrap:wrap">
        ${nextSteps.map(next => `
          <button
            class="btn btn-sm"
            style="${nextBtnStyle(next)};padding:0.5rem 1.1rem;font-size:0.9rem"
            onclick="handleStatusFromModal(${data.id}, '${next}')"
          >
            ${nextBtnLabel(next)}
          </button>
        `).join("")}
      </div>
    ` : `
      <div style="color:var(--muted);font-size:0.9rem;
                  text-align:center;padding:0.5rem">
        ${data.status === "Delivered"
          ? "✅ This order has been delivered."
          : "🚫 This order has been cancelled."}
      </div>
    `}
  `;
}

// ── Update status from inside the detail modal ────────────────
async function handleStatusFromModal(orderId, newStatus) {
  // Disable all buttons in modal during update
  const modalBtns = document.querySelectorAll("#detail-modal-body button");
  modalBtns.forEach(b => { b.disabled = true; });

  const { ok, data } = await api.patch(
    `/api/orders/${orderId}/status`,
    { status: newStatus }
  );

  if (ok) {
    showToast(`Order #${orderId} → ${newStatus}`);
    closeDetailModal();
    await loadOrders(); // refresh table behind modal
  } else {
    const msg = typeof data === "string"
      ? data
      : data?.message ?? "Failed to update status.";
    showToast(`❌ ${msg}`);
    modalBtns.forEach(b => { b.disabled = false; });
  }
}

function closeDetailModal() {
  document.getElementById("detail-modal").classList.remove("open");
}

// Close modal on overlay click
document.getElementById("detail-modal").addEventListener("click", function(e) {
  if (e.target === this) closeDetailModal();
});