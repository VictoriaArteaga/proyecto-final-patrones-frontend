import axios from "axios";

const API_URL = "/api/v1";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add the token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;