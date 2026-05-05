async function handleSave() {
  const name        = document.getElementById("f-name").value.trim();
  const description = document.getElementById("f-desc").value.trim();
  const price       = parseFloat(document.getElementById("f-price").value);
  const category    = document.getElementById("f-category").value.trim();
  const isAvailable = document.getElementById("f-available").checked;
  const imageUrl    = document.getElementById("f-image").value.trim() || null;

  // ✅ تعريف واحد فقط
  const payload = {
    name,
    description,
    price,
    category,
    isAvailable,
    imageUrl,
  };

  // ── Validate ─────────────────────────
  if (!name)        return showModalError("Name is required.");
  if (!description) return showModalError("Description is required.");
  if (!category)    return showModalError("Category is required.");
  if (isNaN(price) || price <= 0)
    return showModalError("Price must be a positive number.");

  hideModalError();

  // ── Add or Edit ─────────────────────
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