import apiClient from "@/api/apiClient";

const exportacionService = {
  exportarExcel: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/exportar-excel`);
    return data;
  },

  exportarPdf: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/exportar-pdf`);
    return data;
  },
};

export default exportacionService;

