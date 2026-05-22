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

const secciones = ["procesos", "resultados", "historial", "exportacion"];

const GestionProcesos = () => {
  const [seccionActiva, setSeccionActiva] = useState(secciones[0]);
  const [procesos, setProcesos] = useState([]);
  const [procesoId, setProcesoId] = useState("");
  const [carrerasCatalogo, setCarrerasCatalogo] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  const [puntajes, setPuntajes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [detalleAlumno, setDetalleAlumno] = useState(null);
  const [codigoDetalle, setCodigoDetalle] = useState("");
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
    } catch (e) {
      setError(e.message);
    }
  };

  const cargarResultados = async () => {
    try {
      setError("");
      const [estadisticasData, resultadosData] = await Promise.all([
        resultadoService.obtenerEstadisticas(procesoId),
        resultadoService.obtenerResultados(procesoId),
      ]);
      setEstadisticas(estadisticasData);

      const carreraPorDefecto = [...(vacantes || [])]
        .sort((a, b) => String(a?.carreraNombre || "").localeCompare(String(b?.carreraNombre || "")))[0];

      const filtrados = carreraPorDefecto
        ? resultadosData.filter((r) => Number(r.carreraId) === Number(carreraPorDefecto.carreraId))
        : resultadosData;

      setResultados(filtrados);
    } catch (e) {
      setError(e.message);
    }
  };

  const cargarDetalle = async () => {
    try {
      setError("");
      const detalle = await resultadoService.obtenerDetalleAlumno(procesoId, codigoDetalle);
      setDetalleAlumno(detalle);
    } catch (e) {
      setError(e.message);
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

  const tieneObservacionesPendientes = incidencias.some((i) =>
    String(i?.estado || "").toUpperCase().includes("PEND")
  );

  const exportar = async (tipo) => {
    try {
      setError("");
      const data = tipo === "excel" ? await exportacionService.exportarExcel(procesoId) : await exportacionService.exportarPdf(procesoId);
      setMensaje(data?.mensaje || "Exportación solicitada");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Gestión de Procesos</h2>

      {mensaje ? <p className="text-sm text-emerald-600">{mensaje}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {secciones.map((sec) => (
          <Button key={sec} variant={seccionActiva === sec ? "default" : "outline"} onClick={() => setSeccionActiva(sec)}>
            {sec}
          </Button>
        ))}
      </div>

      <div className="max-w-sm">
        <label className="text-sm">Proceso</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1"
          value={procesoId}
          onChange={(e) => setProcesoId(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {procesos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {seccionActiva === "procesos" ? (
        <section className="space-y-3">
          <h3 className="font-medium">Configuración y Cargas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="P. correcta" value={formPuntaje.puntajeCorrecta} onChange={(e) => setFormPuntaje((p) => ({ ...p, puntajeCorrecta: e.target.value }))} />
            <Input placeholder="P. incorrecta" value={formPuntaje.puntajeIncorrecta} onChange={(e) => setFormPuntaje((p) => ({ ...p, puntajeIncorrecta: e.target.value }))} />
            <Input placeholder="P. blanco" value={formPuntaje.puntajeBlanco} onChange={(e) => setFormPuntaje((p) => ({ ...p, puntajeBlanco: e.target.value }))} />
          </div>
          <Button variant="outline" onClick={guardarPuntaje} disabled={!procesoId}>Guardar puntajes</Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1"
              value={formVacante.carreraId}
              onChange={(e) => setFormVacante((p) => ({ ...p, carreraId: e.target.value }))}
            >
              <option value="">Carrera</option>
              {carrerasCatalogo.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <Input placeholder="Vacantes" value={formVacante.vacantes} onChange={(e) => setFormVacante((p) => ({ ...p, vacantes: e.target.value }))} />
          </div>
          <Button variant="outline" onClick={guardarVacante} disabled={!procesoId}>Guardar vacante</Button>

          <div className="flex gap-2 flex-wrap">
            <div className="space-y-1">
              <Input type="file" accept=".dbf" onChange={seleccionarDbf("identifi")} />
              <p className="text-xs text-muted-foreground">{archivosDbf.identifi ? archivosDbf.identifi.name : "Sin archivo IDENTIFI"}</p>
              <Button variant="outline" onClick={() => registrarCarga("identifi")} disabled={!procesoId || subiendoDbf.identifi}>
                {subiendoDbf.identifi ? "Subiendo..." : "Cargar identifi"}
              </Button>
            </div>
            <div className="space-y-1">
              <Input type="file" accept=".dbf" onChange={seleccionarDbf("respuest")} />
              <p className="text-xs text-muted-foreground">{archivosDbf.respuest ? archivosDbf.respuest.name : "Sin archivo RESPUEST"}</p>
              <Button variant="outline" onClick={() => registrarCarga("respuest")} disabled={!procesoId || subiendoDbf.respuest}>
                {subiendoDbf.respuest ? "Subiendo..." : "Cargar respuest"}
              </Button>
            </div>
            <div className="space-y-1">
              <Input type="file" accept=".dbf" onChange={seleccionarDbf("claves")} />
              <p className="text-xs text-muted-foreground">{archivosDbf.claves ? archivosDbf.claves.name : "Sin archivo CLAVES"}</p>
              <Button variant="outline" onClick={() => registrarCarga("claves")} disabled={!procesoId || subiendoDbf.claves}>
                {subiendoDbf.claves ? "Subiendo..." : "Cargar claves"}
              </Button>
            </div>
          </div>

          <Button onClick={procesarExamen} disabled={!puedeProcesar}>Procesar examen</Button>
        </section>
      ) : null}

      {seccionActiva === "resultados" ? (
        <section className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={cargarResultados} disabled={!procesoId}>Cargar resultados</Button>
          </div>
          {estadisticas ? <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">{JSON.stringify(estadisticas, null, 2)}</pre> : null}
          <div className="rounded-md border overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Código</th>
                  <th className="text-left p-2">Litocódigo</th>
                  <th className="text-left p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, idx) => (
                  <tr key={`${r.codigo}-${idx}`} className="border-b">
                    <td className="p-2">{r.codigo}</td>
                    <td className="p-2">{r.litocodigo}</td>
                    <td className="p-2">{r.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Input placeholder="Código alumno" value={codigoDetalle} onChange={(e) => setCodigoDetalle(e.target.value)} />
            <Button variant="outline" onClick={cargarDetalle} disabled={!procesoId || !codigoDetalle}>Ver detalle</Button>
          </div>
          {detalleAlumno ? <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">{JSON.stringify(detalleAlumno, null, 2)}</pre> : null}
        </section>
      ) : null}

      {seccionActiva === "historial" ? (
        <section className="space-y-3">
          <Button onClick={cargarAuditoria} disabled={!procesoId}>Cargar historial</Button>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">{JSON.stringify(auditoria, null, 2)}</pre>
        </section>
      ) : null}

      {seccionActiva === "exportacion" ? (
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Exportación deshabilitada cuando hay observaciones pendientes.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => exportar("excel")} disabled={!procesoId || tieneObservacionesPendientes}>Exportar Excel</Button>
            <Button variant="outline" onClick={() => exportar("pdf")} disabled={!procesoId || tieneObservacionesPendientes}>Exportar PDF</Button>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default GestionProcesos;
