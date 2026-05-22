import apiClient from "@/api/apiClient";

const observacionService = {
  listarIncidencias: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/incidencias`);
    return data;
  },

  resolverIncidencia: async (incidenciaId, payload) => {
    const { data } = await apiClient.post(`/api/incidencias/${incidenciaId}/resolver`, payload);
    return data;
  },

  anularAlumno: async (procesoId, codigo, payload) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/alumnos/${codigo}/anular`, payload);
    return data;
  },

  crearAnulacion: async (payload) => {
    const { data } = await apiClient.post("/api/anulaciones", payload);
    return data;
  },
};

export default observacionService;

