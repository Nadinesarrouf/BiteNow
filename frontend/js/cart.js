// ─── Key ─────────────────────────────────────────────────────
const CART_KEY = "bitenow_cart";

// ─── Get full cart array ──────────────────────────────────────
function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

// ─── Save cart array ──────────────────────────────────────────
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ─── Add item (or increment quantity if already in cart) ──────
function addToCart(item) {
  // item = { id, name, price, category }
  const cart = getCart();
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  saveCart(cart);
}

// ─── Remove one item completely ───────────────────────────────
function removeFromCart(itemId) {
  const cart = getCart().filter(c => c.id !== itemId);
  saveCart(cart);
}

// ─── Change quantity (removes if 0) ──────────────────────────
function updateCartQuantity(itemId, quantity) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter(c => c.id !== itemId);
  } else {
    const item = cart.find(c => c.id === itemId);
    if (item) item.quantity = quantity;
  }
  saveCart(cart);
}

// ─── Clear the whole cart ─────────────────────────────────────
function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// ─── Count total items in cart ────────────────────────────────
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

// ─── Get total price ──────────────────────────────────────────
function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}