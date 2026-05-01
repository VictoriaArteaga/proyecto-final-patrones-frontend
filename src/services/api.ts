import axios from "axios";

const API_URL = "https://diseno-conceptual-3d.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;