import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import procesoService from "@/services/procesoService";
import observacionService from "@/services/observacionService";

const Anulados = () => {
  const [procesos, setProcesos] = useState([]);
  const [form, setForm] = useState({
    procesoId: "",
    codigo: "",
    litocodigo: "",
    motivo: "",
    anuladoPor: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

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
      await observacionService.crearAnulacion({
        procesoId: Number(form.procesoId),
        codigo: form.codigo,
        litocodigo: form.litocodigo,
        motivo: form.motivo,
        anuladoPor: form.anuladoPor ? Number(form.anuladoPor) : null,
      });
      setMensaje("Anulación registrada correctamente");
      setForm((prev) => ({ ...prev, codigo: "", litocodigo: "", motivo: "", anuladoPor: "" }));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Anulados</h2>
      {mensaje ? <p className="text-sm text-emerald-600">{mensaje}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="max-w-sm">
        <label className="text-sm">Proceso</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1"
          value={form.procesoId}
          onChange={actualizar("procesoId")}
        >
          <option value="">Seleccionar...</option>
          {procesos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input placeholder="Código" value={form.codigo} onChange={actualizar("codigo")} />
        <Input placeholder="Litocódigo" value={form.litocodigo} onChange={actualizar("litocodigo")} />
        <Input placeholder="Motivo (obligatorio)" value={form.motivo} onChange={actualizar("motivo")} />
        <Input placeholder="ID usuario que anula (opcional)" value={form.anuladoPor} onChange={actualizar("anuladoPor")} />
      </div>

      <Button onClick={registrarAnulacion} disabled={!form.procesoId || !form.codigo || !form.litocodigo}>
        Registrar anulación
      </Button>
    </div>
  );
};

export default Anulados;
