const BASE_URL = "/api/v1";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || `Request failed: ${res.status}`);
  return body;
}

export const api = {
  health: () => request("/health"),
  login: (identifier, password) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password })
  }),
  me: (token) => request("/auth/me", { headers: authHeaders(token) }),
  changePassword: (token, current_password, new_password) => request("/auth/change-password", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ current_password, new_password })
  }),
  listUsers: (token, role = "") => request(`/admin/users${role ? `?role=${encodeURIComponent(role)}` : ""}`, {
    headers: authHeaders(token)
  }),
  createUser: (token, user) => request("/admin/users", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(user)
  }),
  setUserStatus: (token, userId, is_active) => request(`/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ is_active })
  })
};

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}
