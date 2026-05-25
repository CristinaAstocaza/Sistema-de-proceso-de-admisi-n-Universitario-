import apiClient from "@/api/apiClient";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import resultadoService from "@/services/resultadoService";
import catalogoService from "@/services/catalogoService";
import procesoService from "@/services/procesoService";
import logoSanLuis from "@/assets/logo-sanluis.png";

const cargarImagenDataUrl = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo preparar el logo para el PDF"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("No se pudo cargar el logo institucional"));
    img.src = src;
  });

const ordenarResultadosInstitucional = (rows) => {
  const safe = Array.isArray(rows) ? rows : [];
  return [...safe].sort((a, b) => {
    const aAnulado = String(a?.condicion || "").toUpperCase().includes("ANUL");
    const bAnulado = String(b?.condicion || "").toUpperCase().includes("ANUL");
    if (aAnulado !== bAnulado) return aAnulado ? 1 : -1;

    const ma = Number.parseInt(String(a?.merito || ""), 10);
    const mb = Number.parseInt(String(b?.merito || ""), 10);
    const va = Number.isNaN(ma) ? Number.MAX_SAFE_INTEGER : ma;
    const vb = Number.isNaN(mb) ? Number.MAX_SAFE_INTEGER : mb;
    return va - vb;
  });
};

const ordenarPorMeritoConAnuladosAlFinal = (rows) => {
  const data = Array.isArray(rows) ? [...rows] : [];
  return data.sort((a, b) => {
    const aAnulado = String(a?.condicion || "").toUpperCase().includes("ANUL");
    const bAnulado = String(b?.condicion || "").toUpperCase().includes("ANUL");
    if (aAnulado !== bAnulado) return aAnulado ? 1 : -1;

    const ma = Number.parseInt(String(a?.merito || ""), 10);
    const mb = Number.parseInt(String(b?.merito || ""), 10);
    const va = Number.isNaN(ma) ? Number.MAX_SAFE_INTEGER : ma;
    const vb = Number.isNaN(mb) ? Number.MAX_SAFE_INTEGER : mb;
    return va - vb;
  });
};

const recalcularCarreraParaPdf = (rows, vacantes) => {
  const data = Array.isArray(rows) ? [...rows] : [];
  const sorted = data.sort((a, b) => Number(b?.puntaje || 0) - Number(a?.puntaje || 0));

  let sec = 0;
  let meritoActual = 0;
  let puntajeAnterior = null;

  const corte = vacantes > 0 && sorted.length >= vacantes
    ? Number(sorted[vacantes - 1]?.puntaje || 0)
    : null;

  return sorted.map((r, idx) => {
    sec += 1;
    const puntaje = Number(r?.puntaje || 0);
    if (puntajeAnterior === null || puntaje !== puntajeAnterior) {
      meritoActual = idx + 1;
    }
    puntajeAnterior = puntaje;

    const condicion = vacantes <= 0
      ? "NO INGRESO"
      : (idx + 1 <= vacantes || (corte !== null && puntaje === corte))
        ? "INGRESO"
        : "NO INGRESO";

    return {
      ...r,
      sec: String(sec).padStart(4, "0"),
      merito: String(meritoActual),
      condicion,
    };
  });
};

const dibujarEncabezadoInstitucional = ({ doc, logoDataUrl, procesoNombre, carreraNombre, facultadNombre }) => {
  const width = doc.internal.pageSize.getWidth();
  doc.addImage(logoDataUrl, "PNG", 15, 10, 24, 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text('UNIVERSIDAD NACIONAL "SAN LUIS GONZAGA"', width / 2, 15, { align: "center" });
  doc.text("COMISIÓN EJECUTIVA CENTRAL DE ADMISIÓN", width / 2, 20, { align: "center" });
  doc.text(`EXAMEN DE ADMISIÓN ${procesoNombre}`, width / 2, 25, { align: "center" });
  doc.setFontSize(13);
  doc.text("RESULTADOS POR CARRERA PROFESIONAL", width / 2, 35, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Carrera Profesional: ${carreraNombre}`, 15, 43);
  if (facultadNombre) {
    doc.text(`Facultad: ${facultadNombre}`, 15, 48);
    return 52;
  }
  return 47;
};

const exportacionService = {
  exportarExcel: async (procesoId) => {
    const { data } = await apiClient.get(`/api/procesos/${procesoId}/exportar-excel`);
    return data;
  },

  exportarPdf: async (procesoId, meta = {}) => {
    const [reporteFinal, carrerasCatalogo, vacantesProceso] = await Promise.all([
      resultadoService.obtenerReporteFinal(procesoId),
      catalogoService.listarCarreras(),
      procesoService.listarVacantesPorProceso(procesoId),
    ]);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const logoDataUrl = await cargarImagenDataUrl(logoSanLuis);

    const carrerasById = new Map((Array.isArray(carrerasCatalogo) ? carrerasCatalogo : []).map((c) => [String(c.id), c]));
    const vacantesByCarrera = new Map((Array.isArray(vacantesProceso) ? vacantesProceso : []).map((v) => [String(v.carreraId), Number(v.vacantes || 0)]));
    const agrupado = new Map();
    for (const item of ordenarResultadosInstitucional(reporteFinal)) {
      const key = String(item?.carreraId ?? "0");
      if (!agrupado.has(key)) agrupado.set(key, []);
      agrupado.get(key).push(item);
    }

    const procesoNombre = meta?.procesoNombre || `ID ${procesoId}`;
    let cursorY;
    let first = true;

    for (const [carreraId, items] of agrupado.entries()) {
      const carrera = carrerasById.get(carreraId);
      const facultadNombre = carrera?.facultadNombre || carrera?.facultad || "";
      const carreraNombre = carrera?.nombre || "N/D";
      const vacantes = vacantesByCarrera.get(String(carreraId)) ?? 0;

      if (!first) {
        doc.addPage();
      }
      first = false;

      cursorY = dibujarEncabezadoInstitucional({
        doc,
        logoDataUrl,
        procesoNombre,
        carreraNombre,
        facultadNombre,
      });

      const rowsCarrera = ordenarPorMeritoConAnuladosAlFinal(recalcularCarreraParaPdf(items, vacantes)).map((r) => [
        r?.sec ?? "-",
        r?.codigo ?? "-",
        r?.nombreCompleto ?? "-",
        r?.puntaje ?? 0,
        r?.merito ?? "-",
        r?.condicion ?? "-",
      ]);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: 10, right: 10 },
        head: [["SEC", "CÓDIGO", "NOMBRE", "PUNTAJE", "MÉRITO", "CONDICIÓN"]],
        body: rowsCarrera,
        theme: "striped",
        styles: { fontSize: 8.5, cellPadding: 1.8, textColor: [20, 20, 20] },
        headStyles: { fillColor: [230, 230, 230], textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(9);
      doc.text(`Página ${p} de ${totalPages}`, width - 35, 290);
    }

    doc.save(`resultados-generales-proceso-${procesoId}.pdf`);
    return { tipo: "PDF", mensaje: "PDF generado y descargado correctamente" };
  },
};

export default exportacionService;

