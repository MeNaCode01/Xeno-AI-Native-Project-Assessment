export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Generic Fetch request helper
 */
export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error! status: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
