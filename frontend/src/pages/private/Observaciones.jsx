import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import procesoService from "@/services/procesoService";
import observacionService from "@/services/observacionService";

const modalInicial = { abierto: false, tipo: "", incidencia: null, motivo: "" };

const Observaciones = () => {
  const [procesos, setProcesos] = useState([]);
  const [procesoId, setProcesoId] = useState("");
  const [incidencias, setIncidencias] = useState([]);
  const [modal, setModal] = useState(modalInicial);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const incidenciasPendientes = useMemo(
    () => incidencias.filter((i) => String(i?.estado || "").toUpperCase().includes("PEND")),
    [incidencias]
  );

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

  const abrirModal = (tipo, incidencia) => {
    setModal({ abierto: true, tipo, incidencia, motivo: "" });
  };

  const cerrarModal = () => setModal(modalInicial);

  const confirmarAccion = async () => {
    if (!modal.motivo.trim()) {
      setError("El motivo es obligatorio");
      return;
    }
    try {
      setError("");
      if (modal.tipo === "resolver") {
        await observacionService.resolverIncidencia(modal.incidencia.id, { motivo: modal.motivo });
        setMensaje("Observación resuelta");
      }

      if (modal.tipo === "anular") {
        await observacionService.anularAlumno(procesoId, modal.incidencia.codigo, { motivo: modal.motivo });
        setMensaje("Alumno anulado");
      }

      const data = await observacionService.listarIncidencias(procesoId);
      setIncidencias(data);
      cerrarModal();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Observaciones</h2>
      {mensaje ? <p className="text-sm text-emerald-600">{mensaje}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

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

      <p className="text-sm text-muted-foreground">Pendientes: {incidenciasPendientes.length}</p>

      <div className="rounded-md border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidencias.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="p-2">{i.codigo}</td>
                <td className="p-2">{i.tipo}</td>
                <td className="p-2">{i.descripcion}</td>
                <td className="p-2">{i.estado}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => abrirModal("resolver", i)}>
                      Resolver
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => abrirModal("anular", i)}>
                      Anular
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.abierto ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-md bg-background border p-4 space-y-3">
            <h3 className="font-semibold">{modal.tipo === "resolver" ? "Resolver observación" : "Anular alumno"}</h3>
            <Input
              placeholder="Motivo (obligatorio)"
              value={modal.motivo}
              onChange={(e) => setModal((prev) => ({ ...prev, motivo: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cerrarModal}>Cancelar</Button>
              <Button onClick={confirmarAccion}>Confirmar</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Observaciones;
