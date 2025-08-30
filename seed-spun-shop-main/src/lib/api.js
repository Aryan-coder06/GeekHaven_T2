// import axios from "axios";

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_BACKEND_URL,
//   withCredentials: true, // send/receive cookie JWT
// });
import axios from "axios";

const BASE = (import.meta.env.VITE_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

export const api = axios.create({
  baseURL: BASE,              
  withCredentials: true,      
  headers: { "Content-Type": "application/json" },
});

// Optional: nicer errors
api.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(new Error(err?.response?.data?.message || err.message))
);
