// ── Init navbar ───────────────────────────────────────────────
renderAdminNav();

// ── Load all dashboard data in parallel ───────────────────────
async function loadDashboard() {
  const [ordersRes, menuRes] = await Promise.all([
    api.get("/api/orders"),
    api.get("/api/menuitems?availableOnly=false"),
  ]);

  if (ordersRes.ok) {
    renderStats(ordersRes.data);
    renderRecentOrders(ordersRes.data);
  } else {
    document.getElementById("stats-grid").innerHTML =
      `<p style="color:var(--danger)">Failed to load order stats.</p>`;
  }

  if (menuRes.ok) {
    renderMenuSummary(menuRes.data);
  } else {
    document.getElementById("menu-summary-wrap").innerHTML =
      `<p style="color:var(--danger)">Failed to load menu data.</p>`;
  }
}

// ── Stat cards ────────────────────────────────────────────────
function renderStats(orders) {
  const total     = orders.length;
  const pending   = orders.filter(o => o.status === "Pending").length;
  const active    = orders.filter(o =>
    ["Confirmed","Preparing","Ready"].includes(o.status)
  ).length;
  const revenue   = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  document.getElementById("stats-grid").innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📋</div>
      <div class="stat-label">Total Orders</div>
      <div class="stat-value">${total}</div>
      <div class="stat-sub">All time</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⏳</div>
      <div class="stat-label">Pending</div>
      <div class="stat-value">${pending}</div>
      <div class="stat-sub">Awaiting confirmation</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🔥</div>
      <div class="stat-label">Active</div>
      <div class="stat-value">${active}</div>
      <div class="stat-sub">In progress</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💰</div>
      <div class="stat-label">Revenue</div>
      <div class="stat-value">$${revenue.toFixed(0)}</div>
      <div class="stat-sub">Excluding cancelled</div>
    </div>
  `;
}

// ── Recent orders (last 8) ────────────────────────────────────
function renderRecentOrders(orders) {
  const wrap   = document.getElementById("recent-orders-wrap");
  const recent = orders.slice(0, 8);

  if (recent.length === 0) {
    wrap.innerHTML = `
      <div class="empty" style="padding:2rem">
        <div class="empty-icon">📋</div>
        <p>No orders yet.</p>
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${recent.map(o => `
            <tr>
              <td><strong>#${o.id}</strong></td>
              <td>User #${o.userId ?? "—"}</td>
              <td>${o.itemCount} item${o.itemCount !== 1 ? "s" : ""}</td>
              <td><strong>$${o.totalAmount.toFixed(2)}</strong></td>
              <td>${statusBadge(o.status)}</td>
              <td>${formatDate(o.placedAt)}</td>
              <td>
                <a href="orders.html" class="btn btn-outline btn-sm">
                  Manage
                </a>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

// ── Menu summary ──────────────────────────────────────────────
function renderMenuSummary(items) {
  const wrap = document.getElementById("menu-summary-wrap");

  if (items.length === 0) {
    wrap.innerHTML = `
      <div class="empty" style="padding:2rem">
        <div class="empty-icon">🍽️</div>
        <p>No menu items yet.</p>
      </div>`;
    return;
  }

  // Group by category
  const byCategory = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] ?? { total: 0, available: 0 };
    acc[item.category].total++;
    if (item.isAvailable) acc[item.category].available++;
    return acc;
  }, {});

  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Items</th>
            <th>Available</th>
            <th>Unavailable</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(byCategory).map(([cat, counts]) => `
            <tr>
              <td><strong>${cat}</strong></td>
              <td>${counts.total}</td>
              <td style="color:var(--success);font-weight:600">
                ${counts.available}
              </td>
              <td style="color:var(--danger);font-weight:600">
                ${counts.total - counts.available}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

// ── Run ───────────────────────────────────────────────────────
loadDashboard();