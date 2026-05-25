import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import procesoService from "@/services/procesoService";
import observacionService from "@/services/observacionService";
import { AlertCircle, CheckCircle2, Clock3, Eye, Filter, Search } from "lucide-react";

const TIPO_LABEL = {
  SIN_TEMA_RESPUEST: "SIN_TEMA_RESPUEST",
  ALUMNO_NO_ENCONTRADO: "ALUMNO_NO_ENCONTRADO",
  RESPUEST_DUPLICADO: "RESPUEST_DUPLICADO",
  IDENTIFI_DUPLICADO: "IDENTIFI_DUPLICADO",
  RESPUEST_SIN_CLAVE: "RESPUEST_SIN_CLAVE",
  DATOS_INCONSISTENTES: "DATOS_INCONSISTENTES",
  EXAMEN_ANULADO: "EXAMEN_ANULADO",
};

const extraerCampoDecision = (decision, campo) => {
  if (!decision) return null;
  const regex = new RegExp(`${campo}=([^|]+)`, "i");
  const match = String(decision).match(regex);
  return match?.[1]?.trim() || null;
};

const getUltimaAccion = (incidencia) => {
  const decision = String(incidencia?.decisionAdmin || "");
  const accionPorClave = extraerCampoDecision(decision, "accion");
  if (accionPorClave) return accionPorClave;

  // Fallback: backend viejo guarda la acción como primer segmento sin clave
  const primerSegmento = decision
    .split("|")
    .map((s) => s.trim())
    .find(Boolean);

  if (!primerSegmento) return null;
  if (primerSegmento.includes("=")) return null;
  return primerSegmento;
};

const getEstadoVigente = (incidencia) => {
  const accion = String(getUltimaAccion(incidencia) || "").toLowerCase();
  if (accion === "anular_examen") return "ANULADO";
  if (accion) return "RESUELTO";
  return String(incidencia?.estado || "").toUpperCase();
};

const Observaciones = () => {
  const [procesos, setProcesos] = useState([]);
  const [procesoId, setProcesoId] = useState("");
  const [incidencias, setIncidencias] = useState([]);
  const [mensaje] = useState("Vista solo lectura. Las correcciones se realizan desde Resultados.");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const estadoNormalizado = (estadoRaw) => String(estadoRaw || "").toUpperCase();

  const incidenciasFiltradas = useMemo(() => {
    return incidencias.filter((i) => {
      const estadoVigente = getEstadoVigente(i);
      const texto = `${i?.codigo || ""} ${i?.tipo || ""} ${i?.descripcion || ""} ${i?.estado || ""} ${estadoVigente}`.toLowerCase();
      const coincideTexto = texto.includes(busqueda.toLowerCase());

      if (filtroEstado === "todos") return coincideTexto;
      if (filtroEstado === "pendiente") return coincideTexto && estadoNormalizado(estadoVigente).includes("PEND");
      if (filtroEstado === "revision") return coincideTexto && estadoNormalizado(estadoVigente).includes("REVIS");
      if (filtroEstado === "resuelto") return coincideTexto && estadoNormalizado(estadoVigente).includes("RESUEL");
      if (filtroEstado === "anulado") return coincideTexto && estadoNormalizado(estadoVigente).includes("ANUL");
      return coincideTexto;
    });
  }, [incidencias, busqueda, filtroEstado]);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        setError("");
        const data = await procesoService.listarProcesos();
        if (!activo) return;
        setProcesos(data);
        if (data.length > 0) {
          setProcesoId((prev) => prev || String(data[0].id));
        }
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
    const cargar = async () => {
      try {
        setError("");
        const data = await observacionService.listarIncidencias(procesoId);
        if (!activo) return;
        setIncidencias(data);
      } catch (e) {
        if (activo) setError(e.message);
      }
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [procesoId]);

  // Estilos reutilizables adaptados a modo oscuro
  const inputClases = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-500 dark:hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-600/50 transition-all duration-200";
  const panelGlass = "rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/75 dark:bg-slate-900/45 backdrop-blur-xl shadow-[0_12px_35px_-22px_rgba(37,99,235,0.28)]";

  const estadoBadge = (estadoRaw) => {
    const estado = estadoNormalizado(estadoRaw);
    if (estado.includes("PEND")) return { label: "Pendiente", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock3 };
    if (estado.includes("REVIS")) return { label: "En revisión", cls: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400", icon: Eye };
    if (estado.includes("ANUL")) return { label: "Anulado", cls: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400", icon: AlertCircle };
    return { label: "Resuelto", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 };
  };

  const incidenciasPorCodigo = useMemo(() => {
    const map = new Map();
    for (const inc of incidencias) {
      const key = String(inc?.codigo || `inc-${inc?.id}`);
      const current = map.get(key);
      const fecha = new Date(inc?.creadoEn || 0).getTime();
      const fechaCurrent = new Date(current?.creadoEn || 0).getTime();
      if (!current || fecha >= fechaCurrent) map.set(key, inc);
    }
    return Array.from(map.values());
  }, [incidencias]);

  const totalPendientes = incidenciasPorCodigo.filter((i) => estadoNormalizado(getEstadoVigente(i)).includes("PEND")).length;
  const totalRevision = incidenciasPorCodigo.filter((i) => estadoNormalizado(getEstadoVigente(i)).includes("REVIS")).length;
  const totalResueltas = incidenciasPorCodigo.filter((i) => estadoNormalizado(getEstadoVigente(i)).includes("RESUEL")).length;
  const totalAnuladas = incidenciasPorCodigo.filter((i) => estadoNormalizado(getEstadoVigente(i)).includes("ANUL")).length;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Gestión de incidencias</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Observaciones</h2>
      </div>
      
      {mensaje ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{mensaje}</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <div className={`${panelGlass} p-7 grid grid-cols-1 lg:grid-cols-4 gap-6 items-end`}>
        <div className="space-y-1 lg:col-span-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Proceso</label>
          <select className={`h-12 w-full rounded-xl border px-3 ${inputClases}`} value={procesoId} onChange={(e) => setProcesoId(e.target.value)}>
            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Seleccionar...</option>
            {procesos.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 lg:col-span-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Buscar observación</label>
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input className={`h-12 pl-10 ${inputClases}`} placeholder="Código, tipo o descripción..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1 lg:col-span-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
          <div className="relative">
            <Filter className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select className={`h-12 w-full rounded-xl border pl-10 pr-3 ${inputClases}`} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="revision">En revisión</option>
              <option value="resuelto">Resuelto</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={`${panelGlass} p-6`}>
          <p className="text-sm text-slate-500">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalPendientes}</p>
        </div>
        <div className={`${panelGlass} p-6`}>
          <p className="text-sm text-slate-500">En revisión</p>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{totalRevision}</p>
        </div>
        <div className={`${panelGlass} p-6`}>
          <p className="text-sm text-slate-500">Resueltas</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalResueltas}</p>
        </div>
        <div className={`${panelGlass} p-6`}>
          <p className="text-sm text-slate-500">Anuladas</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totalAnuladas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {incidenciasFiltradas.map((i) => {
          const estadoVigente = getEstadoVigente(i);
          const est = estadoBadge(estadoVigente);
          const EstadoIcon = est.icon;
          const accion = getUltimaAccion(i);
          const motivo = extraerCampoDecision(i?.decisionAdmin, "motivo");
          const fecha = extraerCampoDecision(i?.decisionAdmin, "fecha") || extraerCampoDecision(i?.decisionAdmin, "fechaResolucion");
          const tema = extraerCampoDecision(i?.decisionAdmin, "valorCorregido") || extraerCampoDecision(i?.decisionAdmin, "tema");
          return (
            <article key={i.id} className={`${panelGlass} p-7 space-y-6 min-h-[260px]`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Código {i.codigo}</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{TIPO_LABEL[i.tipo] || i.tipo}</h3>
                  <p className="text-sm text-slate-500 mt-1">{i?.creadoEn ? `Fecha: ${new Date(i.creadoEn).toLocaleString()}` : "Fecha no disponible"}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${est.cls}`}>
                  <EstadoIcon className="h-3.5 w-3.5" /> {est.label}
                </span>
              </div>

              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">{i.descripcion}</p>

              {i?.decisionAdmin ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Última resolución</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">Acción:</span> {accion || "-"}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">Motivo:</span> {motivo || "-"}</p>
                  {tema ? <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">Tema:</span> {tema}</p> : null}
                  <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">Estado actual:</span> {estadoVigente}</p>
                  {fecha ? <p className="text-xs text-slate-500 mt-1">Fecha: {fecha}</p> : null}
                </div>
              ) : null}

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-3 text-sm text-slate-600 dark:text-slate-300">
                Corrección administrativa disponible en la sección <strong>Resultados</strong>.
              </div>
            </article>
          );
        })}
        {incidenciasFiltradas.length === 0 && (
          <div className={`${panelGlass} p-10 text-center text-slate-500 dark:text-slate-400 xl:col-span-2`}>
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            No hay observaciones que coincidan con el filtro.
          </div>
        )}
      </div>
    </div>
  );
};

export default Observaciones;
