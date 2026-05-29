import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  // El JWT viaja en una cookie HttpOnly que el backend fija al iniciar sesión.
  // withCredentials hace que el navegador envíe/reciba esa cookie en cada
  // petición (incluso entre dominios distintos: Vercel ↔ Render).
  withCredentials: true,
});

export default api;