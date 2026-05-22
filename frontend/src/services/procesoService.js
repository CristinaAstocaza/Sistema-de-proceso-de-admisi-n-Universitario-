import apiClient from "@/api/apiClient";

const procesoService = {
  listarProcesos: async () => {
    const { data } = await apiClient.get("/api/procesos");
    return data;
  },

  crearProceso: async (payload) => {
    const { data } = await apiClient.post("/api/procesos", payload);
    return data;
  },

  actualizarProceso: async (id, payload) => {
    const { data } = await apiClient.put(`/api/procesos/${id}`, payload);
    return data;
  },

  listarConfiguracionPuntaje: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/configuracion-puntaje`);
    return data;
  },

  guardarConfiguracionPuntaje: async (procesoId, payload) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/configuracion-puntaje`, payload);
    return data;
  },

  listarVacantesPorProceso: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/carreras`);
    return data;
  },

  guardarVacantePorCarrera: async (procesoId, payload) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/carreras`, payload);
    return data;
  },
};

export default procesoService;

