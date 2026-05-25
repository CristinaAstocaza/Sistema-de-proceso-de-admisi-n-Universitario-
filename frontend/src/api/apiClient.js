import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const method = String(config?.method || "GET").toUpperCase();
  const url = `${config?.baseURL || ""}${config?.url || ""}`;
  console.info("[API][REQ]", { method, url, params: config?.params, data: config?.data });
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const method = String(response?.config?.method || "GET").toUpperCase();
    const url = `${response?.config?.baseURL || ""}${response?.config?.url || ""}`;
    console.info("[API][RES]", { method, url, status: response?.status, dataType: typeof response?.data });
    return response;
  },
  (error) => {
    const data = error?.response?.data;
    const message = data?.message || error?.message || "Ocurrió un error inesperado";

    console.error("[API][ERR]", {
      method: String(error?.config?.method || "GET").toUpperCase(),
      url: `${error?.config?.baseURL || ""}${error?.config?.url || ""}`,
      status: error?.response?.status,
      message,
      backendData: data,
    });

    if (data?.details) {
      console.error("Detalles del backend:", data.details);
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;

