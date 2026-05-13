// ── State ─────────────────────────────────────────────────────
let allItems        = [];   // all items from API
let activeCategory  = "All"; // currently selected pill



// ── Toast ─────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

// ── Category emoji map ────────────────────────────────────────
function categoryEmoji(category) {
  const map = {
    pizza:      "🍕",
    burger:     "🍔",
    burgers:    "🍔",
    pasta:      "🍝",
    salad:      "🥗",
    salads:     "🥗",
    drinks:     "🥤",
    drink:      "🥤",
    dessert:    "🍰",
    desserts:   "🍰",
    sushi:      "🍱",
    sandwich:   "🥪",
    sandwiches: "🥪",
    soup:       "🍲",
    soups:      "🍲",
    sides:      "🍟",
    side:       "🍟",
    breakfast:  "🍳",
    seafood:    "🦞",
    chicken:    "🍗",
    steak:      "🥩",
    vegan:      "🥦",
    kids:       "🧒",
  };
  return map[category?.toLowerCase()] ?? "🍽️";
}

// ── Render category pills ─────────────────────────────────────
function renderPills(categories) {
  const container = document.getElementById("category-pills");
  const all = ["All", ...categories];

  container.innerHTML = all.map(cat => `
    <button
      class="pill ${cat === activeCategory ? "active" : ""}"
      onclick="selectCategory('${cat}')"
    >
      ${cat === "All" ? "🍽️ All" : `${categoryEmoji(cat)} ${cat}`}
    </button>
  `).join("");
}

// ── Select a category pill ────────────────────────────────────
function selectCategory(cat) {
  activeCategory = cat;
  renderPills(
    [...new Set(allItems.map(i => i.category))]
  );
  applyFilters();
}

// ── Apply search + category filter ───────────────────────────
function applyFilters() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();

  const filtered = allItems.filter(item => {
    const matchCat    = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !query
      || item.name.toLowerCase().includes(query)
      || item.description.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  renderGrid(filtered);
}

// ── Render the menu grid ──────────────────────────────────────
function renderGrid(items) {
  const grid = document.getElementById("menu-grid");

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="menu-grid">
        <div class="no-results">
          <div class="no-results-icon">🍽️</div>
          <p>No dishes found. Try a different search or category.</p>
        </div>
      </div>`;
    return;
  }

  grid.innerHTML = `
    <div class="menu-grid">
      ${items.map(item => `
        <div class="menu-card" onclick="goToItem(${item.id})">
          <div class="card-thumb">
               <img src="${item.imageUrl || 'https://via.placeholder.com/300'}" alt="${item.name}">
           </div>
          <div class="card-body">
            <div class="card-category">${item.category}</div>
            <div class="card-name">${item.name}</div>
            <div class="card-desc">${item.description || "No description available."}</div>
            <div class="card-footer">
              <span class="card-price">$${item.price.toFixed(2)}</span>
              <button
                class="btn-add"
                onclick="handleAddToCart(event, ${item.id})"
              >+ Add</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>`;
}

// ── Navigate to item detail page ──────────────────────────────
function goToItem(id) {
  window.location.href = `item.html?id=${id}`;
}

// ── Add to cart handler ───────────────────────────────────────
function handleAddToCart(event, itemId) {
  // Stop the click from also triggering the card's goToItem()
  event.stopPropagation();

  const item = allItems.find(i => i.id === itemId);
  if (!item) return;

  addToCart({
    id:       item.id,
    name:     item.name,
    price:    item.price,
    category: item.category,
  });

  showToast(`✅ ${item.name} added to cart!`);
  renderNav(); // refresh cart badge count
}

// ── Fetch data and initialise ─────────────────────────────────
async function init() {
  renderNav();

  // Fetch categories and items in parallel
  const [catRes, itemRes] = await Promise.all([
    api.get("/api/menuitems/categories"),
    api.get("/api/menuitems"),
  ]);

  if (!catRes.ok || !itemRes.ok) {
    document.getElementById("category-pills").innerHTML = "";
    document.getElementById("menu-grid").innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <p>Failed to load menu. Please try again later.</p>
      </div>`;
    return;
  }

  allItems = itemRes.data;
  renderPills(catRes.data);
  renderGrid(allItems);
}

init();