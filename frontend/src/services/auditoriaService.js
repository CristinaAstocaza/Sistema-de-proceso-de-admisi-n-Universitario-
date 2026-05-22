import apiClient from "@/api/apiClient";

const auditoriaService = {
  listarAuditoria: async (params = {}) => {
    const { data } = await apiClient.get("/api/auditoria", { params });
    return data;
  },
};

export default auditoriaService;

