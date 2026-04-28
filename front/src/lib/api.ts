const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export async function apiFetch(
  path: string,
  options: { method?: Method; body?: object; token?: string | null } = {},
) {
  const { method, body, token } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method: method ?? (body ? "POST" : "GET"),
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
