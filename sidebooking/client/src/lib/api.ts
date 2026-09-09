const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export type ApiResponse<T> = { success: boolean; data?: T; message?: string; errors?: string[] };

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("sidebooking_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? body.errors?.join(", ") ?? "Request failed");
  }
  return body.data as T;
}

export function saveSession(data: { token: string; user: unknown }) {
  localStorage.setItem("sidebooking_token", data.token);
  localStorage.setItem("sidebooking_user", JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem("sidebooking_token");
  localStorage.removeItem("sidebooking_user");
}

export function getStoredUser<T>() {
  try {
    return JSON.parse(localStorage.getItem("sidebooking_user") ?? "null") as T | null;
  } catch {
    return null;
  }
}
