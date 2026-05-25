import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import procesoService from "@/services/procesoService";
import catalogoService from "@/services/catalogoService";
import omrService from "@/services/omrService";
import resultadoService from "@/services/resultadoService";
import observacionService from "@/services/observacionService";
import auditoriaService from "@/services/auditoriaService";
import exportacionService from "@/services/exportacionService";
import {
  FolderOpen,
  Trophy,
  Users,
  FileSpreadsheet,
  FileCheck2,
  Upload,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlayCircle,
  BarChart3,
  History,
  FileDown,
  Search,
} from "lucide-react";

const secciones = ["procesos", "resultados", "historial", "exportacion"];
const PAGE_SIZE_RESULTADOS = 10;

const GestionProcesos = () => {
  const [seccionActiva, setSeccionActiva] = useState(secciones[0]);
  const [procesos, setProcesos] = useState([]);
  const [procesoId, setProcesoId] = useState("");
  const [carrerasCatalogo, setCarrerasCatalogo] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  const [puntajes, setPuntajes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [busquedaResultado, setBusquedaResultado] = useState("");
  const [paginaResultado, setPaginaResultado] = useState(1);
  const [cargandoResultados, setCargandoResultados] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);
  const [codigoDetalle, setCodigoDetalle] = useState("");
  const [modalAjuste, setModalAjuste] = useState({ abierto: false, codigo: "", form: { correctas: "", incorrectas: "", blancas: "", puntaje: "", estado: "", observacion: "", motivo: "" } });
  const [auditoria, setAuditoria] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [estadoCargas, setEstadoCargas] = useState({
    identifi: false,
    respuest: false,
    claves: false,
  });
  const [archivosDbf, setArchivosDbf] = useState({ identifi: null, respuest: null, claves: null });
  const [subiendoDbf, setSubiendoDbf] = useState({ identifi: false, respuest: false, claves: false });

  const [formPuntaje, setFormPuntaje] = useState({
    puntajeCorrecta: "",
    puntajeIncorrecta: "",
    puntajeBlanco: "",
  });

  const [formVacante, setFormVacante] = useState({ carreraId: "", vacantes: "" });

  const procesoSeleccionado = useMemo(
    () => procesos.find((p) => String(p.id) === String(procesoId)) || null,
    [procesos, procesoId]
  );

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const [procesosData, carrerasData] = await Promise.all([
          procesoService.listarProcesos(),
          catalogoService.listarCarreras(),
        ]);
        if (!activo) return;
        setError("");
        setProcesos(procesosData);
        setCarrerasCatalogo(carrerasData);
        setProcesoId((prev) => prev || (procesosData.length > 0 ? String(procesosData[0].id) : ""));
      } catch (e) {
        if (activo) setError(e.message);
      }
    };
    cargar();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!procesoId) return;
    let activo = true;
    const cargarProceso = async () => {
      try {
        const [puntajesData, vacantesData, incidenciasData] = await Promise.all([
          procesoService.listarConfiguracionPuntaje(procesoId),
          procesoService.listarVacantesPorProceso(procesoId),
          observacionService.listarIncidencias(procesoId),
        ]);
        if (!activo) return;
        setError("");
        setPuntajes(puntajesData);
        setVacantes(vacantesData);
        setIncidencias(incidenciasData);
      } catch (e) {
        if (activo) setError(e.message);
      }
    };
    cargarProceso();
    return () => {
      activo = false;
    };
  }, [procesoId]);

  const guardarPuntaje = async () => {
    try {
      setError("");
      await procesoService.guardarConfiguracionPuntaje(procesoId, {
        puntajeCorrecta: Number(formPuntaje.puntajeCorrecta),
        puntajeIncorrecta: Number(formPuntaje.puntajeIncorrecta),
        puntajeBlanco: Number(formPuntaje.puntajeBlanco),
      });
      setMensaje("Puntaje guardado");
      setPuntajes(await procesoService.listarConfiguracionPuntaje(procesoId));
    } catch (e) {
      setError(e.message);
    }
  };

  const guardarVacante = async () => {
    try {
      setError("");
      await procesoService.guardarVacantePorCarrera(procesoId, {
        carreraId: Number(formVacante.carreraId),
        vacantes: Number(formVacante.vacantes),
      });
      setMensaje("Vacante guardada");
      setVacantes(await procesoService.listarVacantesPorProceso(procesoId));
    } catch (e) {
      setError(e.message);
    }
  };

  const seleccionarDbf = (tipo) => (event) => {
    const archivo = event.target.files?.[0] || null;
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith(".dbf")) {
      setError("Solo se permiten archivos .dbf");
      return;
    }
    setError("");
    setArchivosDbf((prev) => ({ ...prev, [tipo]: archivo }));
  };

  const registrarCarga = async (tipo) => {
    const archivo = archivosDbf[tipo];
    if (!archivo) {
      setError(`Seleccione archivo .dbf para ${tipo}`);
      return;
    }

    try {
      setError("");
      setSubiendoDbf((prev) => ({ ...prev, [tipo]: true }));
      if (tipo === "identifi") await omrService.subirIdentifiDbf(procesoId, archivo);
      if (tipo === "respuest") await omrService.subirRespuestDbf(procesoId, archivo);
      if (tipo === "claves") await omrService.subirClavesDbf(procesoId, archivo);
      setEstadoCargas((prev) => ({ ...prev, [tipo]: true }));
      setMensaje(`Carga ${tipo} registrada desde ${archivo.name}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubiendoDbf((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const puedeProcesar =
    Boolean(procesoSeleccionado?.id) &&
    puntajes.length > 0 &&
    vacantes.length > 0 &&
    estadoCargas.identifi &&
    estadoCargas.respuest &&
    estadoCargas.claves;

  const procesarExamen = async () => {
    try {
      setError("");
      await omrService.procesar(procesoId);
      await omrService.generarReporte(procesoId);
      setMensaje("Proceso OMR ejecutado");
      if (seccionActiva === "resultados") {
        await cargarResultados();
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const cargarResultados = async () => {
    try {
      if (!procesoId) return;
      setCargandoResultados(true);
      setError("");
      const [estadisticasData, resultadosData] = await Promise.all([
        resultadoService.obtenerEstadisticas(procesoId),
        resultadoService.obtenerResultados(procesoId),
      ]);
      setEstadisticas(estadisticasData);
      setResultados(Array.isArray(resultadosData) ? resultadosData : []);
      setPaginaResultado(1);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargandoResultados(false);
    }
  };

  useEffect(() => {
    if (seccionActiva === "resultados" && procesoId) {
      cargarResultados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccionActiva, procesoId]);

  useEffect(() => {
    const onObservacionesUpdated = (event) => {
      const procesoActualizado = String(event?.detail?.procesoId || "");
      if (!procesoId) return;
      if (procesoActualizado && procesoActualizado !== String(procesoId)) return;
      if (seccionActiva === "resultados") {
        cargarResultados();
      }
    };

    window.addEventListener("observaciones-updated", onObservacionesUpdated);
    return () => {
      window.removeEventListener("observaciones-updated", onObservacionesUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procesoId, seccionActiva]);

  useEffect(() => {
    const onObservacionesUpdated = async (event) => {
      const procesoActualizado = String(event?.detail?.procesoId || "");
      if (!procesoId) return;
      if (procesoActualizado && procesoActualizado !== String(procesoId)) return;

      // invalidar estado previo para evitar mostrar datos viejos
      setSelectedAlumno(null);

      try {
        setError("");

        // refresco fuerte: estadísticas + tabla resultados
        const [estadisticasData, resultadosData] = await Promise.all([
          resultadoService.obtenerEstadisticas(procesoId),
          resultadoService.obtenerResultados(procesoId),
        ]);
        setEstadisticas(estadisticasData);
        setResultados(Array.isArray(resultadosData) ? resultadosData : []);

        // refrescar detalle abierto (modal) si existe alumno seleccionado
        const codigoActivo = String(selectedAlumno?.codigo || codigoDetalle || "").trim();
        if (isModalOpen && codigoActivo) {
          const detalleActualizado = await resultadoService.obtenerDetalleAlumno(procesoId, codigoActivo);
          if (detalleActualizado && typeof detalleActualizado === "object") {
            setSelectedAlumno(detalleActualizado);
          }
        }
      } catch (e) {
        setError(e?.message || "No se pudo refrescar información después de resolver observación.");
      }
    };

    window.addEventListener("observaciones-updated", onObservacionesUpdated);
    return () => {
      window.removeEventListener("observaciones-updated", onObservacionesUpdated);
    };
  }, [procesoId, isModalOpen, selectedAlumno, codigoDetalle]);

  const resultadosFiltrados = useMemo(() => {
    const q = busquedaResultado.trim().toLowerCase();
    if (!q) return resultados;
    return resultados.filter((r) => {
      const texto = `${r?.codigo || ""} ${r?.litocodigo || ""} ${r?.estado || ""} ${r?.puntaje ?? ""} ${r?.carrera || ""} ${r?.observacion || ""}`.toLowerCase();
      return texto.includes(q);
    });
  }, [resultados, busquedaResultado]);

  const totalPaginasResultados = Math.max(1, Math.ceil(resultadosFiltrados.length / PAGE_SIZE_RESULTADOS));
  const paginaActualResultados = Math.min(paginaResultado, totalPaginasResultados);
  const resultadosPaginados = useMemo(() => {
    const inicio = (paginaActualResultados - 1) * PAGE_SIZE_RESULTADOS;
    return resultadosFiltrados.slice(inicio, inicio + PAGE_SIZE_RESULTADOS);
  }, [resultadosFiltrados, paginaActualResultados]);

  const badgeEstado = (estadoRaw) => {
    const estado = String(estadoRaw || "").toUpperCase();
    if (estado.includes("INGRESANTE") && !estado.includes("NO")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (estado.includes("NO INGRESANTE")) return "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    if (estado.includes("OBSERV")) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    if (estado.includes("ANUL")) return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  const badgeCondicion = (condicionRaw) => {
    const condicion = String(condicionRaw || "").toUpperCase();
    if (condicion.includes("INGRESO") && !condicion.includes("NO")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (condicion.includes("NO INGRESO")) return "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    if (condicion.includes("OBSERV")) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    if (condicion.includes("ANUL")) return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  const cargarDetalle = async () => {
    const codigo = String(codigoDetalle || "").trim();
    if (!codigo) {
      setError("Ingresa un código válido para consultar el detalle del alumno.");
      return;
    }

    try {
      setError("");
      setCargandoDetalle(true);
      const detalle = await resultadoService.obtenerDetalleAlumno(procesoId, codigo);

      if (!detalle || typeof detalle !== "object") {
        setSelectedAlumno(null);
        setIsModalOpen(false);
        setError(`No se encontró información del alumno con código ${codigo}.`);
        return;
      }

      setSelectedAlumno(detalle);
      setIsModalOpen(true);
    } catch (e) {
      setSelectedAlumno(null);
      setIsModalOpen(false);
      setError(e?.message || "No se pudo obtener el detalle del alumno.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const abrirDetalleDesdeFila = async (codigo) => {
    const codigoNormalizado = String(codigo || "").trim();
    if (!codigoNormalizado || !procesoId) return;

    setCodigoDetalle(codigoNormalizado);
    try {
      setError("");
      setCargandoDetalle(true);
      const detalle = await resultadoService.obtenerDetalleAlumno(procesoId, codigoNormalizado);
      if (!detalle || typeof detalle !== "object") {
        setSelectedAlumno(null);
        setIsModalOpen(false);
        setError(`No se encontró información del alumno con código ${codigoNormalizado}.`);
        return;
      }
      setSelectedAlumno(detalle);
      setIsModalOpen(true);
    } catch (e) {
      setSelectedAlumno(null);
      setIsModalOpen(false);
      setError(e?.message || "No se pudo obtener el detalle del alumno.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const abrirModalAjuste = (row) => {
    setModalAjuste({
      abierto: true,
      codigo: row?.codigo || "",
      form: {
        correctas: row?.correctas ?? "",
        incorrectas: row?.incorrectas ?? "",
        blancas: row?.blancas ?? "",
        puntaje: row?.puntaje ?? "",
        estado: row?.estado ?? "",
        observacion: row?.observacion ?? "",
        motivo: "",
      },
    });
  };

  const guardarAjusteManual = async () => {
    const codigo = String(modalAjuste?.codigo || "").trim();
    const f = modalAjuste?.form || {};
    if (!codigo || !procesoId) return;
    if (!String(f.motivo || "").trim()) {
      setError("El motivo es obligatorio para guardar el ajuste manual.");
      return;
    }
    try {
      setError("");
      setGuardandoAjuste(true);
      await resultadoService.ajustarResultadoManual(procesoId, codigo, {
        correctas: f.correctas === "" ? null : Number(f.correctas),
        incorrectas: f.incorrectas === "" ? null : Number(f.incorrectas),
        blancas: f.blancas === "" ? null : Number(f.blancas),
        puntaje: f.puntaje === "" ? null : Number(f.puntaje),
        estado: f.estado,
        observacion: f.observacion,
        motivo: f.motivo,
      });
      await cargarResultados();
      if (isModalOpen && String(selectedAlumno?.codigo || "") === codigo) {
        const detalle = await resultadoService.obtenerDetalleAlumno(procesoId, codigo);
        setSelectedAlumno(detalle);
      }
      window.dispatchEvent(new CustomEvent("observaciones-updated", { detail: { procesoId } }));
      setModalAjuste({ abierto: false, codigo: "", form: { correctas: "", incorrectas: "", blancas: "", puntaje: "", estado: "", observacion: "", motivo: "" } });
      setMensaje("Ajuste manual aplicado y reporte recalculado.");
    } catch (e) {
      setError(e?.message || "No se pudo guardar el ajuste manual.");
    } finally {
      setGuardandoAjuste(false);
    }
  };

  const cargarAuditoria = async () => {
    try {
      setError("");
      const data = await auditoriaService.listarAuditoria({ procesoId });
      setAuditoria(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const exportar = async (tipo) => {
    try {
      setError("");
      const data = tipo === "excel"
        ? await exportacionService.exportarExcel(procesoId)
        : await exportacionService.exportarPdf(procesoId, {
            procesoNombre: procesoSeleccionado?.nombre,
          });
      setMensaje(data?.mensaje || "Exportación solicitada");
    } catch (e) {
      setError(e.message);
    }
  };

  // Estilos reutilizables para inputs, selects y botones principales adaptados a modo oscuro
  const inputClases = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-500 dark:hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-600/50 transition-all duration-200";
  const panelGlass = "rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/75 dark:bg-slate-900/45 backdrop-blur-xl shadow-[0_12px_35px_-22px_rgba(37,99,235,0.28)]";
  const seccionMeta = {
    procesos: { icon: FolderOpen, subtitle: "Configura y procesa la evaluación" },
    resultados: { icon: BarChart3, subtitle: "Consulta estadísticas y detalle de alumnos" },
    historial: { icon: History, subtitle: "Auditoría de acciones del proceso" },
    exportacion: { icon: FileDown, subtitle: "Genera reportes oficiales del proceso" },
  };

  const valorTexto = (...valores) => {
    for (const v of valores) {
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
  };

  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Módulo principal</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Gestión de Procesos</h2>
      </div>

      {mensaje ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{mensaje}</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {secciones.map((sec) => (
          (() => {
            const Icono = seccionMeta[sec].icon;
            return (
          <Button 
            key={sec} 
            variant={seccionActiva === sec ? "default" : "outline"} 
            className={`h-[78px] justify-start rounded-2xl px-5 text-left border transition-all duration-200 ${
              seccionActiva === sec
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border-indigo-500"
                : "bg-white/70 dark:bg-slate-900/45 border-slate-300/70 dark:border-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            onClick={() => setSeccionActiva(sec)}
          >
            <div className="flex items-center gap-3">
              <Icono className="h-5 w-5" />
              <div>
                <p className="text-lg font-bold leading-tight">{sec.charAt(0).toUpperCase() + sec.slice(1)}</p>
                <p className={`text-xs ${seccionActiva === sec ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}>{seccionMeta[sec].subtitle}</p>
              </div>
            </div>
          </Button>
            );
          })()
        ))}
      </div>

      {seccionActiva === "procesos" ? (
        <section className="space-y-5">
          <div className={`${panelGlass} p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <FolderOpen className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Selección de Proceso</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Elige el proceso que deseas revisar</p>
              </div>
            </div>
            <select className={`h-12 w-full rounded-xl border px-3 ${inputClases}`} value={procesoId} onChange={(e) => setProcesoId(e.target.value)}>
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Seleccionar...</option>
              {procesos.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className={`${panelGlass} p-5 space-y-4`}>
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Configuración de Puntajes</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-2 text-emerald-500"><CheckCircle className="h-5 w-5" /><span className="text-base font-semibold">Correctas</span></div>
                <Input className={inputClases} placeholder="Ej. 20" value={formPuntaje.puntajeCorrecta} onChange={(e) => setFormPuntaje((p) => ({ ...p, puntajeCorrecta: e.target.value }))} />
              </div>
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/5 p-4">
                <div className="flex items-center gap-2 mb-2 text-rose-500"><XCircle className="h-5 w-5" /><span className="text-base font-semibold">Incorrectas</span></div>
                <Input className={inputClases} placeholder="Ej. -1.125" value={formPuntaje.puntajeIncorrecta} onChange={(e) => setFormPuntaje((p) => ({ ...p, puntajeIncorrecta: e.target.value }))} />
              </div>
              <div className="rounded-xl border border-slate-400/30 bg-slate-500/5 p-4">
                <div className="flex items-center gap-2 mb-2 text-slate-500"><MinusCircle className="h-5 w-5" /><span className="text-base font-semibold">Blancas</span></div>
                <Input className={inputClases} placeholder="Ej. 0" value={formPuntaje.puntajeBlanco} onChange={(e) => setFormPuntaje((p) => ({ ...p, puntajeBlanco: e.target.value }))} />
              </div>
            </div>
            <Button onClick={guardarPuntaje} disabled={!procesoId} className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25">Guardar puntajes</Button>
          </div>

          <div className={`${panelGlass} p-5 space-y-4`}>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-violet-400" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gestión de Vacantes</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_auto] gap-4 items-end">
              <div>
                <label className="text-base font-semibold text-slate-700 dark:text-slate-300">Carrera</label>
                <select className={`h-12 w-full rounded-xl border px-3 ${inputClases}`} value={formVacante.carreraId} onChange={(e) => setFormVacante((p) => ({ ...p, carreraId: e.target.value }))}>
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Seleccionar carrera...</option>
                  {carrerasCatalogo.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-base font-semibold text-slate-700 dark:text-slate-300">Vacantes</label>
                <Input className={`h-12 ${inputClases}`} placeholder="Ej. 40" value={formVacante.vacantes} onChange={(e) => setFormVacante((p) => ({ ...p, vacantes: e.target.value }))} />
              </div>
              <Button onClick={guardarVacante} disabled={!procesoId} className="h-12 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25">Guardar</Button>
            </div>
          </div>

          <div className={`${panelGlass} p-5 space-y-4`}>
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Carga de Archivos DBF</h3>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {[{ key: "identifi", title: "IDENTIFI" }, { key: "respuest", title: "RESPUEST" }, { key: "claves", title: "CLAVES" }].map((item) => (
                <div key={item.key} className="rounded-xl border border-slate-200/70 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-3 hover:border-cyan-400/40 transition-all">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-base"><Upload className="h-4 w-4 text-cyan-400" /> Archivo {item.title}</div>
                  <label className="block rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center cursor-pointer hover:border-cyan-400/50 transition-colors">
                    <p className="text-[15px] text-slate-600 dark:text-slate-300">Seleccionar o arrastrar .dbf</p>
                    <input type="file" accept=".dbf" className="hidden" onChange={seleccionarDbf(item.key)} />
                  </label>
                  {archivosDbf[item.key] ? (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-300/50 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2">
                      <FileCheck2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate" title={archivosDbf[item.key].name}>
                        {archivosDbf[item.key].name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 truncate">Sin archivo seleccionado</p>
                  )}
                  <Button variant="outline" className="w-full h-10 rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => registrarCarga(item.key)} disabled={!procesoId || subiendoDbf[item.key]}>
                    {subiendoDbf[item.key] ? "Subiendo..." : `Cargar ${item.title.toLowerCase()}`}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${panelGlass} p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Estado del sistema: {puedeProcesar ? "Listo para procesar" : "Pendiente de configuración"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Completa puntajes, vacantes y carga de archivos para continuar.</p>
            </div>
            <Button className="h-12 px-8 rounded-xl text-base bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-cyan-500/20" onClick={procesarExamen} disabled={!puedeProcesar}>
              <PlayCircle className="h-5 w-5 mr-2" /> Procesar examen
            </Button>
          </div>
        </section>
      ) : null}

      {seccionActiva === "resultados" ? (
        <section className="space-y-5">
          <div className={`${panelGlass} p-6 space-y-4`}>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-indigo-500" />
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Resultados del Proceso</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Carga y analiza los resultados procesados por carrera y alumno.</p>
              </div>
            </div>
            <Button className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" onClick={cargarResultados} disabled={!procesoId || cargandoResultados}>{cargandoResultados ? "Cargando..." : "Cargar resultados"}</Button>
          </div>
          
          {estadisticas ? <pre className={`text-sm ${panelGlass} p-4 overflow-auto text-slate-800 dark:text-slate-300`}>{JSON.stringify(estadisticas, null, 2)}</pre> : null}

          <div className={`${panelGlass} p-4`}>
            <Input
              className={`h-12 ${inputClases}`}
              placeholder="Buscar por código, litocódigo, estado, puntaje, observación..."
              value={busquedaResultado}
              onChange={(e) => {
                setBusquedaResultado(e.target.value);
                setPaginaResultado(1);
              }}
            />
          </div>
          
          <div className={`${panelGlass} p-0 overflow-auto`}>
            <table className="w-full text-[15px]">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Código</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Litocódigo</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Estado</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Puntaje</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Carrera</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Observación</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Acción</th>
                </tr>
              </thead>
              <tbody>
                {resultadosPaginados.map((r, idx) => (
                  <tr
                    key={`${r.codigo}-${idx}`}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => abrirDetalleDesdeFila(r.codigo)}
                  >
                    <td className="p-4 text-indigo-700 dark:text-indigo-300 font-semibold">{r.codigo}</td>
                    <td className="p-4 text-slate-800 dark:text-slate-200">{r.litocodigo}</td>
                    <td className="p-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badgeEstado(r.estado)}`}>{r.estado || "N/D"}</span></td>
                    <td className="p-4 text-slate-800 dark:text-slate-200">{r.puntaje ?? "-"}</td>
                    <td className="p-4 text-slate-800 dark:text-slate-200">{valorTexto(r.carrera, r.carreraNombre, r.nombreCarrera) || "N/D"}</td>
                    <td className="p-4 text-slate-800 dark:text-slate-200">{r.observacion || "-"}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" className="h-9" onClick={() => abrirModalAjuste(r)}>Corregir</Button>
                    </td>
                  </tr>
                ))}
                {!cargandoResultados && resultadosPaginados.length === 0 ? (
                  <tr>
                    <td className="p-6 text-center text-slate-500" colSpan="7">No existen alumnos procesados para este proceso.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Página {paginaActualResultados} de {totalPaginasResultados}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="h-10" disabled={paginaActualResultados <= 1} onClick={() => setPaginaResultado((p) => Math.max(1, p - 1))}>Anterior</Button>
              <Button variant="outline" className="h-10" disabled={paginaActualResultados >= totalPaginasResultados} onClick={() => setPaginaResultado((p) => Math.min(totalPaginasResultados, p + 1))}>Siguiente</Button>
            </div>
          </div>

          <div className={`${panelGlass} p-5 flex items-end gap-3 max-w-2xl`}>
            <div className="space-y-1 flex-1">
              <label className="text-base font-medium text-slate-700 dark:text-slate-300">Buscar Alumno</label>
              <Input className={`h-12 ${inputClases}`} placeholder="Ingrese el código..." value={codigoDetalle} onChange={(e) => setCodigoDetalle(e.target.value)} />
            </div>
            <Button variant="outline" className="h-12 px-5 rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={cargarDetalle} disabled={!procesoId || !codigoDetalle || cargandoDetalle}><Search className="h-4 w-4 mr-2"/>{cargandoDetalle ? "Buscando..." : "Ver detalle"}</Button>
          </div>

          {isModalOpen && selectedAlumno ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm">
              <div className="w-full max-w-4xl max-h-[92vh] overflow-auto rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-2xl">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Detalle del Alumno</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Código: {selectedAlumno.codigo || codigoDetalle || "N/D"}</p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-900/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Alumno</p>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">{valorTexto(selectedAlumno.nombre, selectedAlumno.nombreCompleto, selectedAlumno.nombres) || "Sin nombre registrado"}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Carrera: {valorTexto(selectedAlumno.carrera, selectedAlumno.carreraNombre, selectedAlumno.nombreCarrera) || "N/D"}</p>
                      </div>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${badgeCondicion(selectedAlumno.condicion || selectedAlumno.estado)}`}>
                        {selectedAlumno.condicion || "N/D"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-emerald-300/40 bg-emerald-50 dark:bg-emerald-900/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Puntaje</p>
                      <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{selectedAlumno.puntaje ?? "0"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Mérito</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedAlumno.merito ?? "-"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Estado interno</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedAlumno.estado || "N/D"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-emerald-300/40 bg-emerald-50/70 dark:bg-emerald-900/10 p-4">
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">Correctas</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{selectedAlumno.correctas ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-rose-300/40 bg-rose-50/70 dark:bg-rose-900/10 p-4">
                      <p className="text-sm text-rose-700 dark:text-rose-400">Incorrectas</p>
                      <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{selectedAlumno.incorrectas ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-300/40 bg-slate-50/70 dark:bg-slate-800/50 p-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">Blancas</p>
                      <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{selectedAlumno.blancas ?? 0}</p>
                    </div>
                  </div>

                  {(selectedAlumno.tipoIncidencia || selectedAlumno.incidencia || selectedAlumno.descripcionIncidencia || selectedAlumno.observacion) ? (
                    <div className="rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-900/10 p-4 space-y-2">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Incidencia</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Tipo:</span> {selectedAlumno.tipoIncidencia || selectedAlumno.incidencia || "N/D"}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Descripción:</span> {selectedAlumno.descripcionIncidencia || selectedAlumno.observacion || "N/D"}</p>
                    </div>
                  ) : null}
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>Exportar / Imprimir</Button>
                  <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {seccionActiva === "historial" ? (
        <section className="space-y-5">
          <div className={`${panelGlass} p-6 space-y-4`}>
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-violet-500" />
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Historial de Auditoría</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Consulta la trazabilidad de acciones realizadas sobre el proceso.</p>
              </div>
            </div>
            <Button className="h-12 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25" onClick={cargarAuditoria} disabled={!procesoId}>Cargar historial</Button>
          </div>
          <pre className={`text-sm ${panelGlass} p-4 overflow-auto text-slate-800 dark:text-slate-300`}>{JSON.stringify(auditoria, null, 2)}</pre>
        </section>
      ) : null}

      {seccionActiva === "exportacion" ? (
        <section className="space-y-5">
          <div className={`${panelGlass} p-6 space-y-4`}>
            <div className="flex items-center gap-3">
              <FileDown className="h-6 w-6 text-cyan-500" />
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Exportación de Reportes</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Genera archivos de salida del proceso en formatos institucionales.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="h-12 px-6 rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => exportar("pdf")} disabled={!procesoId}>Exportar PDF</Button>
            </div>
          </div>
        </section>
      ) : null}

      {modalAjuste.abierto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Corrección manual de resultado</h3>
            <p className="text-sm text-slate-500">Código: {modalAjuste.codigo}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preguntas correctas (buenas)</label>
                <Input className={inputClases} placeholder="Ej. 65" value={modalAjuste.form.correctas} onChange={(e) => setModalAjuste((m) => ({ ...m, form: { ...m.form, correctas: e.target.value } }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preguntas incorrectas (malas)</label>
                <Input className={inputClases} placeholder="Ej. 25" value={modalAjuste.form.incorrectas} onChange={(e) => setModalAjuste((m) => ({ ...m, form: { ...m.form, incorrectas: e.target.value } }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preguntas en blanco</label>
                <Input className={inputClases} placeholder="Ej. 10" value={modalAjuste.form.blancas} onChange={(e) => setModalAjuste((m) => ({ ...m, form: { ...m.form, blancas: e.target.value } }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Puntaje final</label>
                <Input className={inputClases} placeholder="Ej. 1240.500" value={modalAjuste.form.puntaje} onChange={(e) => setModalAjuste((m) => ({ ...m, form: { ...m.form, puntaje: e.target.value } }))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
              <Input className={inputClases} placeholder="Ej. PROCESADO o ANULADO" value={modalAjuste.form.estado} onChange={(e) => setModalAjuste((m) => ({ ...m, form: { ...m.form, estado: e.target.value } }))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observación</label>
              <Input className={inputClases} placeholder="Detalle administrativo del ajuste" value={modalAjuste.form.observacion} onChange={(e) => setModalAjuste((m) => ({ ...m, form: { ...m.form, observacion: e.target.value } }))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motivo del cambio (obligatorio)</label>
              <Input className={inputClases} placeholder="Ej. Corrección por revisión manual del examen" value={modalAjuste.form.motivo} onChange={(e) => setModalAjuste((m) => ({ ...m, form: { ...m.form, motivo: e.target.value } }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalAjuste({ abierto: false, codigo: "", form: { correctas: "", incorrectas: "", blancas: "", puntaje: "", estado: "", observacion: "", motivo: "" } })}>Cancelar</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={guardarAjusteManual} disabled={guardandoAjuste}>{guardandoAjuste ? "Guardando..." : "Guardar ajuste"}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GestionProcesos;
