import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import procesoService from "@/services/procesoService";
import observacionService from "@/services/observacionService";
import resultadoService from "@/services/resultadoService";
import { Ban, Search, Filter, AlertTriangle, CheckCircle2, ListChecks, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

const Anulados = () => {
  const [procesos, setProcesos] = useState([]);
  const [form, setForm] = useState({
    procesoId: "",
    codigo: "",
    motivo: "",
    motivoCritico: "no",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [historialAnulados, setHistorialAnulados] = useState([]);
  const [detalleAlumno, setDetalleAlumno] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const data = await procesoService.listarProcesos();
        if (!activo) return;
        setProcesos(data);
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, procesoId: prev.procesoId || String(data[0].id) }));
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
    if (!form.procesoId) return;
    let activo = true;
    const cargarAnulados = async () => {
      try {
        setError("");
        const data = await observacionService.listarAnulaciones(form.procesoId);
        if (!activo) return;
        const rows = Array.isArray(data)
          ? data.map((a) => {
              const motivoRaw = String(a?.motivo || "");
              const esCritico = motivoRaw.toUpperCase().startsWith("[CRITICO]");
              return {
                ...a,
                motivo: esCritico ? motivoRaw.replace(/^\[CRITICO\]\s*/i, "") : motivoRaw,
                motivoCritico: esCritico,
                estado: a?.estado || "ANULADO",
              };
            })
          : [];
        setHistorialAnulados(rows);
      } catch (e) {
        if (activo) setError(e?.message || "No se pudo cargar anulaciones.");
      }
    };
    cargarAnulados();
    return () => {
      activo = false;
    };
  }, [form.procesoId]);

  const actualizar = (campo) => (event) => {
    setForm((prev) => ({ ...prev, [campo]: event.target.value }));
  };

  const registrarAnulacion = async () => {
    if (!form.motivo.trim()) {
      setError("El motivo es obligatorio");
      return;
    }
    try {
      setError("");
      const motivoFinal = form.motivoCritico === "si"
        ? `[CRITICO] ${form.motivo}`
        : form.motivo;
      await observacionService.anularAlumno(form.procesoId, form.codigo, { motivo: motivoFinal });
      const nuevo = {
        id: Date.now(),
        codigo: form.codigo,
        motivo: form.motivo,
        motivoCritico: form.motivoCritico === "si",
        estado: "ANULADO",
      };
      setHistorialAnulados((prev) => [nuevo, ...prev]);
      const data = await observacionService.listarAnulaciones(form.procesoId);
      const rows = Array.isArray(data)
        ? data.map((a) => {
            const motivoRaw = String(a?.motivo || "");
            const esCritico = motivoRaw.toUpperCase().startsWith("[CRITICO]");
            return {
              ...a,
              motivo: esCritico ? motivoRaw.replace(/^\[CRITICO\]\s*/i, "") : motivoRaw,
              motivoCritico: esCritico,
              estado: a?.estado || "ANULADO",
            };
          })
        : [];
      setHistorialAnulados(rows);
      setMensaje("Anulación registrada correctamente");
      setForm((prev) => ({ ...prev, codigo: "", motivo: "", motivoCritico: "no" }));
    } catch (e) {
      setError(e.message);
    }
  };

  const inputClases = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-500 dark:hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-600/50 transition-all duration-200";
  const panelGlass = "rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/75 dark:bg-slate-900/45 backdrop-blur-xl shadow-[0_12px_35px_-22px_rgba(37,99,235,0.28)]";

  const verDetalleAlumno = async (codigo) => {
    if (!form.procesoId || !codigo) return;
    try {
      setError("");
      const data = await resultadoService.obtenerDetalleAlumno(form.procesoId, codigo);
      setDetalleAlumno(data);
      setModalDetalleAbierto(true);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el detalle del alumno.");
    }
  };

  const filtrados = useMemo(() => {
    return historialAnulados.filter((a) => {
      const texto = `${a.codigo} ${a.motivo} ${a.estado}`.toLowerCase();
      const coincideTexto = texto.includes(busqueda.toLowerCase());
      if (filtroMotivo === "todos") return coincideTexto;
      if (filtroMotivo === "critico") return coincideTexto && !!a.motivoCritico;
      if (filtroMotivo === "no_critico") return coincideTexto && !a.motivoCritico;
      if (filtroMotivo === "activos") return coincideTexto && String(a.estado || "").toUpperCase().includes("ANUL");
      return coincideTexto;
    });
  }, [historialAnulados, busqueda, filtroMotivo]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * PAGE_SIZE;
  const paginados = filtrados.slice(inicio, inicio + PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Control administrativo</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Anulados</h2>
      </div>

      {mensaje ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{mensaje}</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`${panelGlass} p-4`}><p className="text-sm text-slate-500">Total anulados</p><p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{historialAnulados.length}</p></div>
        <div className={`${panelGlass} p-4`}><p className="text-sm text-slate-500">Con motivo crítico</p><p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{historialAnulados.filter((x) => x.motivoCritico).length}</p></div>
        <div className={`${panelGlass} p-4`}><p className="text-sm text-slate-500">Estado activo</p><p className="text-2xl font-bold text-rose-600 dark:text-rose-400">ANULADO</p></div>
      </div>

      <section className={`${panelGlass} p-6 space-y-4`}>
        <div className="flex items-center gap-3">
          <Ban className="h-6 w-6 text-rose-500" />
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Registrar Anulación</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Registra postulantes anulados con trazabilidad.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Seleccionar Proceso</label>
            <select className={`h-12 w-full rounded-xl border px-3 ${inputClases}`} value={form.procesoId} onChange={actualizar("procesoId")}>
              <option value="">Seleccionar...</option>
              {procesos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Código</label>
            <Input className={`h-12 ${inputClases}`} placeholder="Ej. 20260012" value={form.codigo} onChange={actualizar("codigo")} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motivo</label>
            <Input className={`h-12 ${inputClases}`} placeholder="Ej. Doble marcación / error OMR..." value={form.motivo} onChange={actualizar("motivo")} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">¿Motivo crítico?</label>
            <select className={`h-12 w-full rounded-xl border px-3 ${inputClases}`} value={form.motivoCritico} onChange={actualizar("motivoCritico")}>
              <option value="no">No</option>
              <option value="si">Sí</option>
            </select>
          </div>
        </div>

        <Button className="h-12 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white" onClick={registrarAnulacion} disabled={!form.procesoId || !form.codigo}>
          Registrar anulación
        </Button>
      </section>

      <section className={`${panelGlass} p-6 space-y-4`}>
        <div className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-indigo-500" />
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Listado de Anulados</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Consulta y filtra los postulantes anulados.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input className={`h-12 pl-10 ${inputClases}`} placeholder="Buscar por código o motivo..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} />
          </div>
          <div className="relative">
            <Filter className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select className={`h-12 w-full rounded-xl border pl-10 pr-3 ${inputClases}`} value={filtroMotivo} onChange={(e) => { setFiltroMotivo(e.target.value); setPagina(1); }}>
              <option value="todos">Todos</option>
              <option value="critico">Solo críticos</option>
              <option value="no_critico">Solo no críticos</option>
              <option value="activos">Estado activo</option>
            </select>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="text-left p-4 font-semibold">Código</th>
                <th className="text-left p-4 font-semibold">Motivo</th>
                <th className="text-left p-4 font-semibold">Crítico</th>
                <th className="text-left p-4 font-semibold">Estado</th>
                <th className="text-left p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map((a) => (
                <tr key={a.id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="p-4">{a.codigo}</td>
                  <td className="p-4"><span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{a.motivo}</span></td>
                  <td className="p-4">{a.motivoCritico ? "Sí" : "No"}</td>
                  <td className="p-4"><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"><AlertTriangle className="h-3 w-3" /> {a.estado}</span></td>
                  <td className="p-4">
                    <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => verDetalleAlumno(a.codigo)}>
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              ))}
              {paginados.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan="5">
                    <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                    No hay registros para el filtro actual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Página {paginaActual} de {totalPaginas}</p>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9 rounded-lg" disabled={paginaActual <= 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}><ChevronLeft className="h-4 w-4 mr-1" />Anterior</Button>
            <Button variant="outline" className="h-9 rounded-lg" disabled={paginaActual >= totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}>Siguiente<ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      </section>

      {modalDetalleAbierto && detalleAlumno ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Detalle del Alumno</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><span className="font-semibold">Código:</span> {detalleAlumno.codigo || "-"}</p>
              <p><span className="font-semibold">Nombre:</span> {detalleAlumno.nombre || "-"}</p>
              <p><span className="font-semibold">Carrera:</span> {detalleAlumno.carrera || "-"}</p>
              <p><span className="font-semibold">Condición:</span> {detalleAlumno.condicion || "-"}</p>
              <p><span className="font-semibold">Puntaje:</span> {detalleAlumno.puntaje ?? "-"}</p>
              <p><span className="font-semibold">Mérito:</span> {detalleAlumno.merito || "-"}</p>
              <p><span className="font-semibold">Correctas:</span> {detalleAlumno.correctas ?? 0}</p>
              <p><span className="font-semibold">Incorrectas:</span> {detalleAlumno.incorrectas ?? 0}</p>
              <p><span className="font-semibold">Blancas:</span> {detalleAlumno.blancas ?? 0}</p>
              <p><span className="font-semibold">Estado interno:</span> {detalleAlumno.estadoInterno || "-"}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setModalDetalleAbierto(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Anulados;

