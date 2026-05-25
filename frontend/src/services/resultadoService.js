import apiClient from "@/api/apiClient";

const resultadoService = {
  obtenerResultados: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/resultados`);
    return data;
  },

  obtenerEstadisticas: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/estadisticas`);
    return data;
  },

  obtenerDetalleAlumno: async (procesoId, codigo) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/alumnos/${codigo}/detalle`);
    return data;
  },

  ajustarResultadoManual: async (procesoId, codigo, payload) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/alumnos/${codigo}/ajustar-resultado`, payload);
    return data;
  },

  obtenerReporteFinal: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/reporte-final`);
    return data;
  },

  obtenerReporteFinalPorCarrera: async (procesoId, carreraId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/reporte-final/carrera/${carreraId}`);
    return data;
  },
};

export default resultadoService;

