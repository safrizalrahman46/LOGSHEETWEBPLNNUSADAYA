import axios from "axios";

// Base URL API:
// - Bisa dioverride lewat env NEXT_PUBLIC_API_URL
// - Saat frontend dibuka lewat IP LAN (http://192.168.x.x:3000) otomatis
//   memakai host yang sama port 8080, supaya login & data jalan di HP/tablet.
function resolveApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
    if (!isLocal && protocol === "http:") {
      return `http://${hostname}:8080/api`;
    }
  }
  return "http://localhost:8080/api";
}

export const API_BASE_URL = resolveApiBase();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pln_token");
    const url = config.url || "";
    const isPublic = url.startsWith("/public") || url.startsWith("public") || url.includes("/public/") || url.includes("/auth/login");
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const publicPaths = ["/login", "/guest", "/berita", "/"];
      const isPublic = publicPaths.some(
        (p) => window.location.pathname === p || window.location.pathname.startsWith("/berita")
      );
      if (!isPublic) {
        const hadToken = Boolean(localStorage.getItem("pln_token"));
        localStorage.removeItem("pln_token");
        localStorage.removeItem("pln_user");
        window.location.href = hadToken ? "/login?expired=1" : "/login";
      }
    }
    return Promise.reject(error);
  }
);
