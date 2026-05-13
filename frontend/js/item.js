// ── State ─────────────────────────────────────────────────────
let currentItem = null;
let quantity    = 1;

// ── Read ?id= from URL ────────────────────────────────────────
function getItemIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get("id"));
  return isNaN(id) ? null : id;
}

// ── Emoji fallback map ────────────────────────────────────────
function categoryEmoji(category) {
  const map = {
    pizza:"🍕", burger:"🍔", burgers:"🍔", pasta:"🍝",
    salad:"🥗", salads:"🥗", drinks:"🥤", drink:"🥤",
    dessert:"🍰", desserts:"🍰", sushi:"🍱", sandwich:"🥪",
    sandwiches:"🥪", soup:"🍲", soups:"🍲", sides:"🍟",
    side:"🍟", breakfast:"🍳", seafood:"🦞", chicken:"🍗",
    steak:"🥩", vegan:"🥦", kids:"🧒",
  };
  return map[category?.toLowerCase()] ?? "🍽️";
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ── Render item detail ────────────────────────────────────────
function renderItem(item) {
  const container = document.getElementById("item-container");
  document.title  = `BiteNow — ${item.name}`;

  // ── Image or emoji fallback ─────────────────────────────
  const imageHtml = item.imageUrl
    ? `<img
         src="${item.imageUrl}"
         alt="${item.name}"
         onerror="this.style.display='none';
                  this.nextElementSibling.style.display='flex'"
       />
       <div class="item-visual-fallback" style="display:none">
         ${categoryEmoji(item.category)}
       </div>`
    : `<div class="item-visual-fallback">
         ${categoryEmoji(item.category)}
       </div>`;

  container.innerHTML = `
    <div class="item-layout">

      <!-- Left: image -->
      <div class="item-visual">${imageHtml}</div>

      <!-- Right: details -->
      <div class="item-details">

        <div class="item-category">${item.category}</div>
        <h1 class="item-name">${item.name}</h1>

        <p class="item-description">
          ${item.description || "No description available for this item."}
        </p>

        <hr class="item-divider"/>

        <div class="item-price">$${item.price.toFixed(2)}</div>

        <div>
          ${item.isAvailable
            ? `<span class="tag-available">✅ Available</span>`
            : `<span class="tag-unavailable">❌ Currently Unavailable</span>`
          }
        </div>

        <hr class="item-divider"/>

        <!-- Quantity + Add to Cart -->
        <div class="add-row">
          <div class="qty-stepper">
            <button onclick="changeQty(-1)">−</button>
            <span id="qty-display">1</span>
            <button onclick="changeQty(1)">+</button>
          </div>
          <button
            class="btn-add-cart"
            id="add-btn"
            onclick="handleAddToCart()"
            ${!item.isAvailable ? "disabled" : ""}
          >
            ${item.isAvailable ? "🛒 Add to Cart" : "Not Available"}
          </button>
        </div>

      </div>
    </div>`;
}

// ── Quantity stepper ──────────────────────────────────────────
function changeQty(delta) {
  quantity = Math.max(1, Math.min(20, quantity + delta));
  document.getElementById("qty-display").textContent = quantity;
}

// ── Add to cart ───────────────────────────────────────────────
function handleAddToCart() {
  if (!currentItem) return;

  const cart     = getCart();
  const existing = cart.find(c => c.id === currentItem.id);
  const newQty   = (existing ? existing.quantity : 0) + quantity;

  if (existing) {
    updateCartQuantity(currentItem.id, newQty);
  } else {
    addToCart({
      id:       currentItem.id,
      name:     currentItem.name,
      price:    currentItem.price,
      category: currentItem.category,
    });
    if (quantity > 1) updateCartQuantity(currentItem.id, quantity);
  }

  showToast(`✅ ${quantity} × ${currentItem.name} added to cart!`);
  renderNav();
}

// ── Error state ───────────────────────────────────────────────
function renderError(msg) {
  document.getElementById("item-container").innerHTML = `
    <div class="item-error">
      <div class="item-error-icon">🍽️</div>
      <p>${msg}</p>
      <a href="menu.html" class="btn btn-primary"
         style="margin-top:1.2rem">← Back to Menu</a>
    </div>`;
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  renderNav();

  const id = getItemIdFromUrl();
  if (!id) { renderError("No item specified."); return; }

  const { ok, data } = await api.get(`/api/menuitems/${id}`);
  if (!ok) { renderError(data ?? "Item not found."); return; }

  currentItem = data;
  renderItem(data);
}

init();