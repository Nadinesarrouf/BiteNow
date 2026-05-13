/* /* ═══════════════════════════════════════════════════════════
   BiteNow — profile.js  (with editable address + profile)
═══════════════════════════════════════════════════════════ */

const RESTAURANT_PHONE    = "+961 03 819 412";
const RESTAURANT_WHATSAPP = "https://wa.me/96103819412";

// ── Status badges ──────────────────────────────────────────────
const STATUS_CONFIG = {
  Delivered:    { cls: "badge--success", icon: "ti-circle-check" },
  Preparing:    { cls: "badge--warning", icon: "ti-fire"         },
  "On the way": { cls: "badge--info",    icon: "ti-bike"         },
  Pending:      { cls: "badge--default", icon: "ti-clock"        },
  Cancelled:    { cls: "badge--danger",  icon: "ti-circle-x"     },
};

function statusBadge(status) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  return `<span class="badge ${cfg.cls}">
    <i class="ti ${cfg.icon}" aria-hidden="true"></i>${status}
  </span>`;
}

// ── Utils ──────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric", month: "short", year: "numeric"
    }).format(new Date(iso));
  } catch { return iso; }
}

function initials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function pick(obj, ...keys) {
  for (const key of keys) {
    const val = obj?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "")
      return String(val).trim();
  }
  return "";
}

function fill(elementId, obj, ...keys) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = pick(obj, ...keys) || "—";
}

// ── Skeleton loaders ───────────────────────────────────────────
function renderSkeletons(count = 3) {
  document.getElementById("orders-list").innerHTML = Array.from({ length: count }).map(() => `
    <li class="order-card order-card--skeleton" aria-hidden="true">
      <span class="skeleton skeleton--lg"   style="display:block;margin-bottom:8px"></span>
      <span class="skeleton skeleton--text" style="display:block;margin-bottom:8px"></span>
      <span class="skeleton skeleton--sm"   style="display:block"></span>
    </li>`).join("");
}

// ── Error helpers ──────────────────────────────────────────────
function showProfileError(msg) {
  const el = document.getElementById("profile-error");
  if (!el) return;
  el.querySelector("span").textContent = msg;
  el.hidden = false;
}

// ── Load profile ───────────────────────────────────────────────
async function loadProfile() {
  const user = getUser();
  if (!user) { window.location.href = "login.html"; return; }

  try {
    const { ok, data } = await api.get(`/api/Users/${user.id}`);

    if (!ok) {
      showProfileError("Could not load your profile. Please try again.");
      return;
    }

    const merged = Object.assign({}, user, data);

    // Hero section
    document.getElementById("avatar-initials").textContent = initials(merged.name);
    document.getElementById("profile-name").textContent    = merged.name || "—";
    document.getElementById("profile-id").textContent      = `ID #${merged.id ?? "—"}`;

    // Info rows
    fill("profile-email",      merged, "email");
    fill("profile-email-hero", merged, "email");
    fill("profile-phone",      merged, "phone", "phoneNumber", "mobile");
    fill("profile-location",   merged, "location", "city", "region");

    // Address section — editable
    renderAddressSection(merged);

    // Also update local storage with latest from server
    updateUser({
      name:     merged.name,
      phone:    merged.phone,
      location: merged.location,
      address:  merged.address,
    });

  } catch (err) {
    console.error("Profile error:", err);
    showProfileError("Unexpected error loading profile.");
  }
}

// ── Address section renderer ────────────────────────────────────
function renderAddressSection(user) {
  const el = document.getElementById("profile-address");
  if (!el) return;

  const address = pick(user, "address", "homeAddress", "deliveryAddress");

  el.style.whiteSpace = "normal";

  if (address) {
    el.innerHTML = `
      <span style="display:block;margin-bottom:8px">${address}</span>
      <button
        onclick="openAddressEdit('${address.replace(/'/g, "\\'")}')"
        style="
          background:none;border:1px solid var(--border);border-radius:6px;
          padding:4px 10px;font-size:0.78rem;cursor:pointer;color:var(--muted);
        "
      >
        ✏️ Edit address
      </button>`;
  } else {
    el.innerHTML = `
      <span style="color:#9E9892;font-style:italic;font-size:0.82rem;display:block;margin-bottom:6px;">
        Not set yet
      </span>
      <button
        onclick="openAddressEdit('')"
        style="
          background:#E85C2A;color:#fff;;border:none;border-radius:6px;
          padding:6px 14px;font-size:0.82rem;cursor:pointer;font-weight:600;
        "
      >
        + Add my address
      </button>`;
  }
}

// ── Address edit modal ──────────────────────────────────────────
function openAddressEdit(currentAddress) {
  document.getElementById("addr-edit-input").value = currentAddress || "";
  document.getElementById("addr-edit-error").style.display = "none";
  document.getElementById("addr-edit-modal").style.display = "flex";
  document.getElementById("addr-edit-input").focus();
}

function closeAddressEdit() {
  document.getElementById("addr-edit-modal").style.display = "none";
}

async function saveAddressEdit() {
  const user    = getUser();
  const address = document.getElementById("addr-edit-input").value.trim();
  const errEl   = document.getElementById("addr-edit-error");
  const saveBtn = document.getElementById("addr-edit-save-btn");

  if (!address) {
    errEl.textContent = "Please enter your address.";
    errEl.style.display = "block";
    return;
  }

  errEl.style.display = "none";
  saveBtn.disabled    = true;
  saveBtn.textContent = "Saving…";

  const { ok, data } = await api.patch(`/api/users/${user.id}/address`, { address });

  saveBtn.disabled    = false;
  saveBtn.textContent = "Save";

  if (ok) {
    // Update local storage
    updateUser({ address });
    // Re-render address section
    renderAddressSection({ address });
    closeAddressEdit();

    // Show a small success flash
    const flash = document.getElementById("addr-success-flash");
    if (flash) {
      flash.style.display = "block";
      setTimeout(() => flash.style.display = "none", 2500);
    }
  } else {
    const msg = typeof data === "string"
      ? data
      : data?.message ?? "Could not save address. Please try again.";
    errEl.textContent = msg;
    errEl.style.display = "block";
  }
}

// ── Load orders ────────────────────────────────────────────────
async function loadOrders() {
  const user = getUser();
  if (!user) return;

  renderSkeletons(3);

  try {
    const { ok, data } = await api.get(`/api/orders/user/${user.id}`);

    if (!ok) {
      document.getElementById("orders-list").innerHTML = "";
      const errEl = document.getElementById("orders-error");
      if (errEl) { errEl.querySelector("span").textContent = "Could not load your orders."; errEl.hidden = false; }
      return;
    }

    const orders = Array.isArray(data) ? data : [];
    const countEl = document.getElementById("orders-count");
    if (countEl) countEl.textContent = orders.length;

    const list = document.getElementById("orders-list");
    list.innerHTML = "";

    if (orders.length === 0) {
      const emptyEl = document.getElementById("orders-empty");
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    const emptyEl = document.getElementById("orders-empty");
    if (emptyEl) emptyEl.hidden = true;

    orders.forEach(order => {
      const itemNames = Array.isArray(order.items)
        ? order.items.map(i => typeof i === "string" ? i : i.name ?? "Item").join(", ")
        : order.itemsSummary ?? "—";

      const li = document.createElement("li");
      li.className = "order-card";
      li.innerHTML = `
        <div class="order-card__header">
          <span class="order-card__id">
            <i class="ti ti-receipt" aria-hidden="true"></i>
            Order #${order.id}
          </span>
          ${statusBadge(order.status ?? "Pending")}
        </div>
        <p class="order-card__items">${itemNames}</p>
        <div class="order-card__footer">
          <span class="order-card__meta">
            <i class="ti ti-calendar" aria-hidden="true"></i>
            ${formatDate(order.placedAt ?? order.createdAt ?? order.date)}
          </span>
          <span class="order-card__total">
            $${Number(order.totalAmount ?? order.total ?? 0).toFixed(2)}
          </span>
        </div>`;
      list.appendChild(li);
    });

  } catch (err) {
    console.error("Orders error:", err);
    document.getElementById("orders-list").innerHTML = "";
  }
}

// ── Init ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderNav === "function") renderNav();
  loadProfile();
  loadOrders();

  // Close address modal when clicking the overlay background
  const modal = document.getElementById("addr-edit-modal");
  if (modal) {
    modal.addEventListener("click", function(e) {
      if (e.target === this) closeAddressEdit();
    });
  }
});