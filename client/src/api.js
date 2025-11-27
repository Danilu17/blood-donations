// client/src/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const api = axios.create({ baseURL });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Por qué: Error handling consistente en UI
api.interceptors.response.use(
  r => r,
  err => {
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Error de red. Verifique el servidor.";
    err.userMessage = msg;
    return Promise.reject(err);
  }
);

export default api;
