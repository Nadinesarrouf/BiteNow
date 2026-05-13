/* ═══════════════════════════════════════════════════════════
   BiteNow — signup.js
   Handles signup form: validation, location detect, API call
═══════════════════════════════════════════════════════════ */

// ── Redirect if already logged in ─────────────────────────────
if (isLoggedIn()) {
  window.location.href = "menu.html";
}

// ── Alert helpers ──────────────────────────────────────────────
function showError(msg) {
  const box  = document.getElementById("error-msg");
  const text = document.getElementById("error-text");
  text.textContent = msg;
  box.classList.add("show");
  document.getElementById("success-msg").classList.remove("show");
}

function showSuccess(msg) {
  const box  = document.getElementById("success-msg");
  const text = document.getElementById("success-text");
  text.textContent = msg;
  box.classList.add("show");
  document.getElementById("error-msg").classList.remove("show");
}

function clearAlerts() {
  document.getElementById("error-msg").classList.remove("show");
  document.getElementById("success-msg").classList.remove("show");
}

// ── Password show / hide ───────────────────────────────────────
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "ti ti-eye-off";
  } else {
    input.type = "password";
    icon.className = "ti ti-eye";
  }
}

// ── Geo-status helper ──────────────────────────────────────────
function setGeoStatus(msg, type /* "ok" | "error" | "" */) {
  const el = document.getElementById("geo-status");
  el.innerHTML = "";
  el.className = "geo-status" + (type ? " " + type : "");

  if (type === "") {
    // loading state — add spinner
    const spinner = document.createElement("span");
    spinner.className = "geo-spinner";
    el.appendChild(spinner);
  }

  const text = document.createTextNode(" " + msg);
  el.appendChild(text);
}

function clearGeoStatus() {
  const el = document.getElementById("geo-status");
  el.className = "geo-status";
  el.innerHTML = "";
}

// ── Location detection ─────────────────────────────────────────
function detectLocation() {
  if (!navigator.geolocation) {
    setGeoStatus("Geolocation is not supported by this browser.", "error");
    return;
  }

  const btn = document.getElementById("detect-btn");
  btn.disabled = true;
  setGeoStatus("Requesting your location…", "");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setGeoStatus("Got coordinates, resolving address…", "");

      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "Accept-Language": "en" } }
        );

        if (!r.ok) throw new Error("Lookup failed");

        const d = await r.json();
        const a = d.address || {};

        // Build a readable label: suburb + city/town + country
        const suburb  = a.suburb || a.neighbourhood || a.quarter || "";
        const city    = a.city   || a.town          || a.village || a.county || "";
        const country = a.country || "";
        const parts   = [suburb, city, country].filter(Boolean);
        const label   = parts.length ? parts.join(", ") : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        document.getElementById("location").value = label;
        setGeoStatus(label, "ok");

      } catch {
        // Fallback: raw coordinates
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        document.getElementById("location").value = fallback;
        setGeoStatus("Address lookup failed — coordinates saved.", "ok");
      }

      btn.disabled = false;
    },
    (err) => {
      const msgs = {
        1: "Location permission was denied.",
        2: "Position is currently unavailable.",
        3: "Location request timed out.",
      };
      setGeoStatus(msgs[err.code] || "Could not retrieve location.", "error");
      btn.disabled = false;
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}

// ── Main signup handler ────────────────────────────────────────
async function handleSignup() {
  clearAlerts();

  const name            = document.getElementById("name").value.trim();
  const email           = document.getElementById("email").value.trim();
  const phone           = document.getElementById("phone").value.trim();
  const location        = document.getElementById("location").value.trim();
  const password        = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const btn             = document.getElementById("signup-btn");

  // ── Validation ─────────────────────────────────────
  if (!name || !email || !phone || !location || !password || !confirmPassword) {
    showError("Please fill in all fields.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("Please enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  // ── Loading state ───────────────────────────────────
  btn.disabled    = true;
  btn.textContent = "Creating account…";

  // ── API call ────────────────────────────────────────
  const { ok, data } = await api.post("/api/users/register", {
    name,
    email,
    phone,
    location,
    password,
  });

  if (ok) {
    saveUser({
      id:       data.id,
      name:     data.name,
      email:    data.email,
      phone:    data.phone,
      location: data.location,
      role:     data.role,
    });

    showSuccess("Account created successfully! Redirecting…");

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 1000);

  } else {
    const msg =
      typeof data === "string"
        ? data
        : data?.message ?? "Signup failed. Please try again.";

    showError(msg);
    btn.disabled    = false;
    btn.textContent = "Create Account";
  }
}

// ── Enter key support ──────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSignup();
});
