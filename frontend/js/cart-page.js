// ── Category emoji ─────────────────────────────────────────────
function categoryEmoji(category) {
  const map = {
    pizza:      "🍕", burger:     "🍔", burgers:    "🍔",
    pasta:      "🍝", salad:      "🥗", salads:     "🥗",
    drinks:     "🥤", drink:      "🥤", dessert:    "🍰",
    desserts:   "🍰", sushi:      "🍱", sandwich:   "🥪",
    sandwiches: "🥪", soup:       "🍲", soups:      "🍲",
    sides:      "🍟", side:       "🍟", breakfast:  "🍳",
    seafood:    "🦞", chicken:    "🍗", steak:      "🥩",
    vegan:      "🥦", kids:       "🧒",
  };
  return map[category?.toLowerCase()] ?? "🍽️";
}

// ── Toast ──────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}



// ── Render the full cart page ──────────────────────────────────
function renderCart() {
  if (document.getElementById("order-modal")) return;

  const layout = document.getElementById("cart-layout");
  const cart   = getCart();
  const user   = getUser();

  if (cart.length === 0) {
    layout.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious items from the menu!</p>
        <a href="menu.html" class="btn btn-primary" style="margin-top:1.2rem">
          Browse Menu
        </a>
      </div>`;
    return;
  }

  const itemCount = getCartCount();
  const subtotal  = getCartTotal();

  const itemsHtml = cart.map(item => `
    <div class="cart-row" id="row-${item.id}">
      <div class="cart-row-emoji">${categoryEmoji(item.category)}</div>
      <div class="cart-row-info">
        <div class="cart-row-name">${item.name}</div>
        <div class="cart-row-price">$${item.price.toFixed(2)} each</div>
      </div>
      <div class="qty-stepper">
        <button onclick="handleQtyChange(${item.id}, ${item.quantity - 1})">−</button>
        <span>${item.quantity}</span>
        <button onclick="handleQtyChange(${item.id}, ${item.quantity + 1})">+</button>
      </div>
      <div class="cart-row-line">$${(item.price * item.quantity).toFixed(2)}</div>
      <button class="btn-remove" onclick="handleRemove(${item.id})" title="Remove">🗑️</button>
    </div>
  `).join("");

  const loggedIn = !!user;
  const summaryHtml = `
    <div class="summary-card">
      <h2>Order Summary</h2>
      <div class="summary-row">
        <span>Items (${itemCount})</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Delivery</span>
        <span style="color:var(--success);font-weight:600">Free</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span id="summary-total">$${subtotal.toFixed(2)}</span>
      </div>
      <label class="notes-label" for="order-notes">
        📝 Special instructions (optional)
      </label>
      <textarea
        class="notes-input"
        id="order-notes"
        placeholder="E.g. No onions, extra sauce, ring the doorbell..."
      ></textarea>
      <button
        class="btn-place-order"
        id="place-order-btn"
        onclick="handlePlaceOrder()"
        ${!loggedIn ? "disabled" : ""}
      >
        ${loggedIn ? "🧾 Place Order" : "🔒 Login to Place Order"}
      </button>
      ${!loggedIn ? `
        <p class="login-nudge">
          <a href="login.html">Login</a> or
          <a href="signup.html">Sign Up</a> to place your order.
        </p>` : ""}

      <div class="contact-strip-root"></div>
    </div>
  `;

  layout.innerHTML = `
    <div class="cart-items">${itemsHtml}</div>
    ${summaryHtml}
  `;

  // Re-run contact strip since layout was just rebuilt
  if (typeof renderContactStrip === "function") renderContactStrip();
}

// ── Quantity change ────────────────────────────────────────────
function handleQtyChange(itemId, newQty) {
  if (newQty < 1) { handleRemove(itemId); return; }
  if (newQty > 20) return;
  updateCartQuantity(itemId, newQty);
  renderCart();
  renderNav();
}

// ── Remove item ────────────────────────────────────────────────
function handleRemove(itemId) {
  removeFromCart(itemId);
  showToast("Item removed from cart.");
  renderCart();
  renderNav();
}

// ── Place order ────────────────────────────────────────────────
async function handlePlaceOrder() {
  const user = getUser();
  if (!user) { window.location.href = "login.html"; return; }

  const cart  = getCart();
  const notes = document.getElementById("order-notes")?.value.trim() ?? "";
  const btn   = document.getElementById("place-order-btn");

  if (cart.length === 0) { showToast("Your cart is empty!"); return; }

  btn.disabled    = true;
  btn.textContent = "Placing order...";

  const payload = {
    userId: user.id,
    notes:  notes,
    items:  cart.map(item => ({ menuItemId: item.id, quantity: item.quantity })),
  };

  const { ok, data } = await api.post("/api/orders", payload);

  if (ok) {
    clearCart();
    renderNav();
    showOrderModal(data?.orderId ?? "");
}
  
}

// ── Init ───────────────────────────────────────────────────────
renderNav();
renderCart();
