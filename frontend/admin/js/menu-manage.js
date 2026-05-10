let allItems   = [];
let editingId  = null;

// ── Load & Render ────────────────────────────────────────────
async function loadItems() {
  const res = await api.get("/api/menuitems");

  if (!res.ok) {
    document.getElementById("menu-table-wrap").innerHTML =
      `<p style="color:var(--danger)">Failed to load menu items.</p>`;
    return;
  }

  allItems = res.data;
  populateCategoryFilter();
  renderTable(allItems);
}

function populateCategoryFilter() {
  const select = document.getElementById("filter-category");
  const categories = [...new Set(allItems.map(i => i.category))].sort();

  select.innerHTML = `<option value="">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.toLowerCase();
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function renderTable(items) {
  const wrap = document.getElementById("menu-table-wrap");

  if (!items.length) {
    wrap.innerHTML = `<p style="color:var(--muted);padding:1rem">No items found.</p>`;
    return;
  }

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Available</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr
            data-name="${item.name.toLowerCase()}"
            data-category="${item.category.toLowerCase()}"
            data-available="${item.isAvailable}"
          >
            <td>
              ${item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${item.name}"
                       style="width:56px;height:44px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">`
                : `<div style="width:56px;height:44px;background:var(--surface-alt);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.4rem">🍽️</div>`
              }
            </td>
            <td><strong>${item.name}</strong><br/>
              <span style="font-size:0.82rem;color:var(--muted)">${item.description}</span>
            </td>
            <td>${item.category}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
              <span class="badge ${item.isAvailable ? 'badge-success' : 'badge-muted'}">
                ${item.isAvailable ? "Available" : "Unavailable"}
              </span>
            </td>
            <td style="display:flex;gap:0.5rem">
              <button class="btn btn-outline" style="padding:0.3rem 0.8rem;font-size:0.85rem"
                onclick="openEditModal(${item.id})">✏️ Edit</button>
              <button class="btn btn-danger" style="padding:0.3rem 0.8rem;font-size:0.85rem"
                onclick="deleteItem(${item.id}, '${item.name.replace(/'/g, "\\'")}')">🗑️ Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// ── Filters ──────────────────────────────────────────────────
function applyFilters() {
  const search       = document.getElementById("filter-search").value.trim().toLowerCase();
  const category     = document.getElementById("filter-category").value.toLowerCase();
  const availability = document.getElementById("filter-availability").value;

  const filtered = allItems.filter(item => {
    const matchSearch   = !search   || item.name.toLowerCase().includes(search)
                                    || item.description.toLowerCase().includes(search);
    const matchCategory = !category || item.category.toLowerCase() === category;
    const matchAvail    =
      !availability ||
      (availability === "available"   && item.isAvailable) ||
      (availability === "unavailable" && !item.isAvailable);

    return matchSearch && matchCategory && matchAvail;
  });

  renderTable(filtered);
}

// ── Modal ────────────────────────────────────────────────────
function openAddModal() {
  editingId = null;
  document.getElementById("modal-title").textContent = "Add Menu Item";
  document.getElementById("f-name").value        = "";
  document.getElementById("f-desc").value        = "";
  document.getElementById("f-price").value       = "";
  document.getElementById("f-category").value    = "";
  document.getElementById("f-available").checked = true;
  document.getElementById("f-image").value       = "";
  document.getElementById("image-preview-wrap").style.display = "none";
  hideModalError();
  document.getElementById("item-modal").classList.add("open");
}

function openEditModal(id) {
  const item = allItems.find(i => i.id === id);
  if (!item) return;

  editingId = id;
  document.getElementById("modal-title").textContent      = "Edit Menu Item";
  document.getElementById("f-name").value                 = item.name;
  document.getElementById("f-desc").value                 = item.description;
  document.getElementById("f-price").value                = item.price;
  document.getElementById("f-category").value             = item.category;
  document.getElementById("f-available").checked          = item.isAvailable;
  document.getElementById("f-image").value                = item.imageUrl || "";

  const wrap = document.getElementById("image-preview-wrap");
  const img  = document.getElementById("image-preview");
  if (item.imageUrl) {
    img.src = item.imageUrl;
    wrap.style.display = "block";
  } else {
    wrap.style.display = "none";
  }

  hideModalError();
  document.getElementById("item-modal").classList.add("open");
}

function closeModal() {
  document.getElementById("item-modal").classList.remove("open");
}

function showModalError(msg) {
  const el = document.getElementById("modal-error");
  el.textContent = msg;
  el.style.display = "block";
}

function hideModalError() {
  const el = document.getElementById("modal-error");
  el.textContent = "";
  el.style.display = "none";
}

// ── Save ─────────────────────────────────────────────────────
async function handleSave() {
  const name        = document.getElementById("f-name").value.trim();
  const description = document.getElementById("f-desc").value.trim();
  const price       = parseFloat(document.getElementById("f-price").value);
  const category    = document.getElementById("f-category").value.trim();
  const isAvailable = document.getElementById("f-available").checked;
  const imageUrl    = document.getElementById("f-image").value.trim() || null;

  const payload = { name, description, price, category, isAvailable, imageUrl };

  if (!name)        return showModalError("Name is required.");
  if (!description) return showModalError("Description is required.");
  if (!category)    return showModalError("Category is required.");
  if (isNaN(price) || price <= 0)
    return showModalError("Price must be a positive number.");

  hideModalError();

  let res;
  if (editingId === null) {
    res = await api.post("/api/menuitems", payload);
  } else {
    res = await api.put(`/api/menuitems/${editingId}`, payload);
  }

  if (res.ok) {
    closeModal();
    showToast(editingId === null
      ? `✅ "${name}" added to menu!`
      : `✅ "${name}" updated!`
    );
    await loadItems();
  } else {
    const msg = typeof res.data === "string"
      ? res.data
      : res.data?.message ?? res.data?.title ?? "Failed to save item.";
    showModalError(msg);
  }
}

// ── Delete ───────────────────────────────────────────────────
async function deleteItem(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

  const res = await api.delete(`/api/menuitems/${id}`);

  if (res.ok) {
    showToast(`🗑️ "${name}" deleted.`);
    await loadItems();
  } else {
    showToast("Failed to delete item.", "error");
  }
}

// ── Init ─────────────────────────────────────────────────────
loadItems();