import apiClient from "@/api/apiClient";

const omrService = {
  cargarIdentifi: async (procesoId, payload) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/cargar-identifi`, payload);
    return data;
  },

  cargarRespuest: async (procesoId, payload) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/cargar-respuest`, payload);
    return data;
  },

  cargarClaves: async (procesoId, payload) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/cargar-claves`, payload);
    return data;
  },

  subirIdentifiDbf: async (procesoId, archivo) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/upload-identifi-dbf`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  subirRespuestDbf: async (procesoId, archivo) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/upload-respuest-dbf`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  subirClavesDbf: async (procesoId, archivo) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/upload-claves-dbf`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  procesar: async (procesoId) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/procesar`);
    return data;
  },

  generarReporte: async (procesoId) => {
    const { data } = await apiClient.post(`/api/procesos/${procesoId}/generar-reporte`);
    return data;
  },
};

export default omrService;

