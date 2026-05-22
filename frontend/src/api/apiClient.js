import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const message = data?.message || error?.message || "Ocurrió un error inesperado";

    if (data?.details) {
      console.error("Detalles del backend:", data.details);
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;

