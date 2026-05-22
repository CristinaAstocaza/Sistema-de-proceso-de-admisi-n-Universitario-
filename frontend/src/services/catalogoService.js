import apiClient from "@/api/apiClient";

const catalogoService = {
  listarCarreras: async () => {
    const { data } = await apiClient.get("/api/carreras");
    return data;
  },

  crearCarrera: async (payload) => {
    const { data } = await apiClient.post("/api/carreras", payload);
    return data;
  },

  actualizarCarrera: async (id, payload) => {
    const { data } = await apiClient.put(`/api/carreras/${id}`, payload);
    return data;
  },

  listarFacultades: async () => {
    const { data } = await apiClient.get("/api/facultades");
    return data;
  },

  crearFacultad: async (payload) => {
    const { data } = await apiClient.post("/api/facultades", payload);
    return data;
  },

  actualizarFacultad: async (id, payload) => {
    const { data } = await apiClient.put(`/api/facultades/${id}`, payload);
    return data;
  },

  listarPostulantes: async () => {
    const { data } = await apiClient.get("/api/postulantes");
    return data;
  },

  crearPostulante: async (payload) => {
    const { data } = await apiClient.post("/api/postulantes", payload);
    return data;
  },
};

export default catalogoService;

