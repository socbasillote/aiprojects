export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error(
        "The server took too long to respond. Make sure the backend is running.",
      );
    throw new Error(
      "Unable to reach the backend server. Make sure the server is running.",
    );
  } finally {
    window.clearTimeout(timeout);
  }
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : null;
  if (!response.ok) {
    const error = new Error(
      body?.message || `Request failed with status ${response.status}`,
    );
    error.status = response.status;
    error.code = body?.code || null;
    error.remaining = body?.remaining;
    throw error;
  }
  return body;
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  listDesigns: () => request("/designs"),
  createDesign: (payload) =>
    request("/designs", { method: "POST", body: JSON.stringify(payload) }),
  getDesign: (id) => request(`/designs/${id}`),
  updateDesign: (id, payload) =>
    request(`/designs/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteDesign: (id) => request(`/designs/${id}`, { method: "DELETE" }),
  generateDesign: (payload) =>
    request(
      "/ai/generate-design",
      { method: "POST", body: JSON.stringify(payload) },
      180000,
    ),
  modifyDesign: (payload) =>
    request(
      "/ai/modify-design",
      { method: "POST", body: JSON.stringify(payload) },
      60000,
    ),
  generateImage: (payload) =>
    request(
      "/ai/generate-image",
      { method: "POST", body: JSON.stringify(payload) },
      120000,
    ),
  getBillingPackages: () => request("/billing/packages"),
  getAiCredits: () => request("/billing/credits"),
  estimateAiCost: (payload) =>
    request("/ai/estimate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  estimateAiCredits: (payload) =>
    request("/ai/estimate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createPayPalOrder: (payload) =>
    request(
      "/billing/paypal/create-order",
      { method: "POST", body: JSON.stringify(payload) },
      30000,
    ),
  capturePayPalOrder: (payload) =>
    request(
      "/billing/paypal/capture-order",
      { method: "POST", body: JSON.stringify(payload) },
      30000,
    ),
  uploadImage: async (file, width, height) => {
    if (!width || !height) {
      const objectUrl = URL.createObjectURL(file);
      try {
        const dimensions = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () =>
            resolve({
              width: image.naturalWidth || image.width,
              height: image.naturalHeight || image.height,
            });
          image.onerror = () =>
            reject(new Error("Unable to read image dimensions"));
          image.src = objectUrl;
        });
        width = dimensions.width;
        height = dimensions.height;
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("width", String(width));
    formData.append("height", String(height));
    const response = await fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : null;
    if (!response.ok)
      throw new Error(
        body?.message || `Image upload failed with status ${response.status}`,
      );
    return body;
  },
  listAssets: () => request("/assets"),
  deleteAsset: (id) => request(`/assets/${id}`, { method: "DELETE" }),
};
