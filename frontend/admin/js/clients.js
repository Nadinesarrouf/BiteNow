// ── admin/js/clients.js ───────────────────────────────────────
// Admin page: view all clients, their addresses, orders & spending

let allClients = [];

renderAdminNav();
loadClients();

// ── Fetch ─────────────────────────────────────────────────────
async function loadClients() {
  const wrap = document.getElementById("clients-wrap");
  wrap.innerHTML = `<div class="spinner" style="margin:2rem auto"></div>`;

  const { ok, data } = await api.get("/api/users/admin/clients");

  if (!ok) {
    wrap.innerHTML = `
      <div class="empty" style="padding:3rem">
        <div class="empty-icon">⚠️</div>
        <p style="color:var(--danger)">Failed to load clients.</p>
      </div>`;
    return;
  }

  allClients = data;
  renderTable(allClients);
}

// ── Render ────────────────────────────────────────────────────
function renderTable(clients) {
  const wrap = document.getElementById("clients-wrap");

  if (clients.length === 0) {
    wrap.innerHTML = `
      <div class="empty" style="padding:3rem">
        <div class="empty-icon">👥</div>
        <p>No clients found.</p>
      </div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Home Address</th>
            <th>Orders</th>
            <th>Total Spent</th>
            <th>Last Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${clients.map(c => `
            <tr id="client-row-${c.id}">
              <td><strong>#${c.id}</strong></td>
              <td>
                <div style="font-weight:600">${c.name}</div>
                <div style="font-size:0.75rem;color:var(--muted)">
                  Joined ${formatDate(c.joinedAt)}
                </div>
              </td>
              <td style="font-size:0.87rem">${c.email}</td>
              <td style="font-size:0.87rem">
                ${c.phone
                  ? `<a href="tel:${c.phone}" style="color:var(--primary);text-decoration:none">${c.phone}</a>`
                  : `<span style="color:var(--muted)">—</span>`}
              </td>
              <td style="font-size:0.87rem">${c.location || '—'}</td>
              <td id="addr-cell-${c.id}" style="font-size:0.87rem;max-width:200px">
                ${c.address
                  ? `<span title="${c.address}">${truncate(c.address, 40)}</span>`
                  : `<span style="color:var(--muted);font-style:italic">Not set</span>`}
              </td>
              <td style="text-align:center">
                <strong>${c.totalOrders}</strong>
              </td>
              <td>
                <strong style="color:var(--success)">$${c.totalSpent.toFixed(2)}</strong>
              </td>
              <td style="font-size:0.82rem;white-space:nowrap">
                ${c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}
              </td>
              <td>
                <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
                  <button
                    class="btn btn-outline btn-sm"
                    onclick="openAddressModal(${c.id}, '${escapeStr(c.name)}', '${escapeStr(c.address)}')"
                  >
                    📍 Address
                  </button>
                  <a
                    href="orders.html"
                    class="btn btn-outline btn-sm"
                    style="font-size:0.78rem"
                  >
                    📋 Orders
                  </a>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;
}

// ── Search filter ─────────────────────────────────────────────
function applySearch() {
  const q = document.getElementById("search-input").value.trim().toLowerCase();
  const filtered = allClients.filter(c =>
    !q ||
    c.name.toLowerCase().includes(q)   ||
    c.email.toLowerCase().includes(q)  ||
    c.phone.toLowerCase().includes(q)  ||
    c.location.toLowerCase().includes(q)
  );
  renderTable(filtered);
}

// ── Address Modal ─────────────────────────────────────────────
let editingClientId = null;

function openAddressModal(clientId, clientName, currentAddress) {
  editingClientId = clientId;
  document.getElementById("addr-modal-name").textContent = clientName;
  document.getElementById("addr-input").value = currentAddress || "";
  document.getElementById("addr-error").style.display = "none";
  document.getElementById("addr-modal").classList.add("open");
  document.getElementById("addr-input").focus();
}

function closeAddressModal() {
  document.getElementById("addr-modal").classList.remove("open");
  editingClientId = null;
}

async function saveAddress() {
  const address = document.getElementById("addr-input").value.trim();
  const errEl   = document.getElementById("addr-error");

  if (!address) {
    errEl.textContent = "Please enter an address.";
    errEl.style.display = "block";
    return;
  }

  errEl.style.display = "none";
  const saveBtn = document.getElementById("addr-save-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  const { ok, data } = await api.patch(
    `/api/users/admin/${editingClientId}/address`,
    { address }
  );

  saveBtn.disabled = false;
  saveBtn.textContent = "Save Address";

  if (ok) {
    // Update local data
    const client = allClients.find(c => c.id === editingClientId);
    if (client) client.address = address;

    // Update the cell in table without full reload
    const cell = document.getElementById(`addr-cell-${editingClientId}`);
    if (cell) {
      cell.innerHTML = `<span title="${address}">${truncate(address, 40)}</span>`;
    }

    showToast(`✅ Address updated for client #${editingClientId}`);
    closeAddressModal();
  } else {
    const msg = typeof data === "string"
      ? data
      : data?.message ?? "Failed to save address.";
    errEl.textContent = msg;
    errEl.style.display = "block";
  }
}

// ── Helpers ───────────────────────────────────────────────────
function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function escapeStr(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Close modal on overlay click
document.getElementById("addr-modal").addEventListener("click", function(e) {
  if (e.target === this) closeAddressModal();
});