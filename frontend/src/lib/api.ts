import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
