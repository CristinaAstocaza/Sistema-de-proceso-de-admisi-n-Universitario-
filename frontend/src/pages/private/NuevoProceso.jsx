import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import procesoService from "@/services/procesoService";
import { crearProcesoVacio } from "@/models/procesoModel";
import { ClipboardList } from "lucide-react";

const NuevoProceso = () => {
  const [proceso, setProceso] = useState(crearProcesoVacio());
  const [procesoCreado, setProcesoCreado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const actualizarCampo = (estadoSetter, campo) => (event) => {
    estadoSetter((prev) => ({ ...prev, [campo]: event.target.value }));
  };

  const crearProceso = async () => {
    try {
      setError("");
      const nuevo = await procesoService.crearProceso(proceso);
      setProcesoCreado(nuevo);
      setMensaje("Proceso creado correctamente");
    } catch (e) {
      setError(e.message);
    }
  };

  // Estilos reutilizables adaptados a modo oscuro
  const inputClases = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-500 dark:hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-600/50 transition-all duration-200";
  const btnPrimarioClases = "bg-slate-700 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white transition-colors duration-200";
  const panelGlass = "rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/75 dark:bg-slate-900/45 backdrop-blur-xl shadow-[0_12px_35px_-22px_rgba(37,99,235,0.28)]";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Creación guiada</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Nuevo Proceso</h2>
      </div>

      {mensaje ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{mensaje}</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <section className={`${panelGlass} p-6 space-y-5`}>
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-indigo-500" />
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Información General</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Datos principales del proceso de admisión.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del proceso</label>
            <Input className={`h-12 ${inputClases}`} placeholder="Ej. Admisión 2026" value={proceso.nombre} onChange={actualizarCampo(setProceso, "nombre")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Modalidad</label>
            <Input className={`h-12 ${inputClases}`} placeholder="Ej. Presencial" value={proceso.modalidad} onChange={actualizarCampo(setProceso, "modalidad")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Periodo</label>
            <Input className={`h-12 ${inputClases}`} placeholder="Ej. 2026-I" value={proceso.periodo} onChange={actualizarCampo(setProceso, "periodo")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
            <Input className={`h-12 ${inputClases}`} placeholder="Ej. Activo" value={proceso.estado} onChange={actualizarCampo(setProceso, "estado")} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
            <Input className={`h-12 ${inputClases}`} placeholder="Breve descripción del proceso..." value={proceso.descripcion} onChange={actualizarCampo(setProceso, "descripcion")} />
          </div>
        </div>
      </section>

      <section className={`${panelGlass} p-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between`}>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Resumen del Proceso</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">ID generado: {procesoCreado?.id || "Sin crear"}</p>
        </div>
        <Button className={`h-12 px-6 rounded-xl ${btnPrimarioClases}`} onClick={crearProceso}>Crear Proceso</Button>
      </section>
    </div>
  );
};

export default NuevoProceso;
