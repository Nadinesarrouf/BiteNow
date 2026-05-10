const API_BASE = "http://localhost:5133";

// ─── Core fetch wrapper ──────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const defaultHeaders = { "Content-Type": "application/json" };
  options.headers = { ...defaultHeaders, ...(options.headers || {}) };

  try {
    const res = await fetch(url, options);

    let data = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    }

    return { ok: res.ok, status: res.status, data };

  } catch (err) {
    // Network error — backend is down or unreachable
    console.warn(`[api] ${options.method || "GET"} ${path} failed:`, err.message);
    return {
      ok: false,
      status: 0,
      data: { message: "Cannot reach the server. Please check your connection or try again later." }
    };
  }
}

// ─── Convenience methods ─────────────────────────────────────
const api = {
  get:    (path)       => apiFetch(path),
  post:   (path, body) => apiFetch(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    (path, body) => apiFetch(path, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  (path, body) => apiFetch(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path)       => apiFetch(path, { method: "DELETE" }),
};