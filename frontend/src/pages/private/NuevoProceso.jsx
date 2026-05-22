import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import procesoService from "@/services/procesoService";
import omrService from "@/services/omrService";
import { crearProcesoVacio, crearPuntajeVacio } from "@/models/procesoModel";

const NuevoProceso = () => {
  const [proceso, setProceso] = useState(crearProcesoVacio());
  const [puntaje, setPuntaje] = useState(crearPuntajeVacio());
  const [procesoCreado, setProcesoCreado] = useState(null);
  const [archivosDbf, setArchivosDbf] = useState({ identifi: null, respuest: null, claves: null });
  const [cargasDbf, setCargasDbf] = useState({ identifi: false, respuest: false, claves: false });
  const [subiendo, setSubiendo] = useState({ identifi: false, respuest: false, claves: false });
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

  const guardarPuntaje = async () => {
    if (!procesoCreado?.id) return;
    try {
      setError("");
      await procesoService.guardarConfiguracionPuntaje(procesoCreado.id, {
        puntajeCorrecta: Number(puntaje.puntajeCorrecta),
        puntajeIncorrecta: Number(puntaje.puntajeIncorrecta),
        puntajeBlanco: Number(puntaje.puntajeBlanco),
      });
      setMensaje("Puntajes guardados");
    } catch (e) {
      setError(e.message);
    }
  };

  const seleccionarArchivoDbf = (tipo) => (event) => {
    const archivo = event.target.files?.[0] || null;
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith(".dbf")) {
      setError("Solo se permiten archivos .dbf");
      return;
    }
    setError("");
    setArchivosDbf((prev) => ({ ...prev, [tipo]: archivo }));
  };

  const cargarArchivo = async (tipo) => {
    if (!procesoCreado?.id) return;
    const archivo = archivosDbf[tipo];
    if (!archivo) {
      setError(`Seleccione archivo .dbf para ${tipo}`);
      return;
    }
    try {
      setError("");
      setSubiendo((prev) => ({ ...prev, [tipo]: true }));
      if (tipo === "identifi") await omrService.subirIdentifiDbf(procesoCreado.id, archivo);
      if (tipo === "respuest") await omrService.subirRespuestDbf(procesoCreado.id, archivo);
      if (tipo === "claves") await omrService.subirClavesDbf(procesoCreado.id, archivo);
      setCargasDbf((prev) => ({ ...prev, [tipo]: true }));
      setMensaje(`Carga ${tipo} registrada desde ${archivo.name}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubiendo((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const puedeProcesar = procesoCreado?.id && cargasDbf.identifi && cargasDbf.respuest && cargasDbf.claves;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Nuevo Proceso</h2>

      {mensaje ? <p className="text-sm text-emerald-600">{mensaje}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Nombre" value={proceso.nombre} onChange={actualizarCampo(setProceso, "nombre")} />
        <Input placeholder="Modalidad" value={proceso.modalidad} onChange={actualizarCampo(setProceso, "modalidad")} />
        <Input placeholder="Periodo" value={proceso.periodo} onChange={actualizarCampo(setProceso, "periodo")} />
        <Input placeholder="Estado" value={proceso.estado} onChange={actualizarCampo(setProceso, "estado")} />
        <Input placeholder="Descripción" value={proceso.descripcion} onChange={actualizarCampo(setProceso, "descripcion")} />
      </section>

      <Button onClick={crearProceso}>Guardar Proceso</Button>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input placeholder="Puntaje correcta" value={puntaje.puntajeCorrecta} onChange={actualizarCampo(setPuntaje, "puntajeCorrecta")} />
        <Input placeholder="Puntaje incorrecta" value={puntaje.puntajeIncorrecta} onChange={actualizarCampo(setPuntaje, "puntajeIncorrecta")} />
        <Input placeholder="Puntaje blanco" value={puntaje.puntajeBlanco} onChange={actualizarCampo(setPuntaje, "puntajeBlanco")} />
      </section>
      <Button variant="outline" onClick={guardarPuntaje} disabled={!procesoCreado?.id}>
        Guardar Puntajes
      </Button>

      <section className="space-y-3">
        <div className="space-y-1">
          <Input type="file" accept=".dbf" onChange={seleccionarArchivoDbf("identifi")} />
          <p className="text-xs text-muted-foreground">{archivosDbf.identifi ? archivosDbf.identifi.name : "Sin archivo IDENTIFI"}</p>
          <Button variant="outline" onClick={() => cargarArchivo("identifi")} disabled={!procesoCreado?.id || subiendo.identifi}>
            {subiendo.identifi ? "Subiendo..." : "Cargar Identifi"}
          </Button>
        </div>
        <div className="space-y-1">
          <Input type="file" accept=".dbf" onChange={seleccionarArchivoDbf("respuest")} />
          <p className="text-xs text-muted-foreground">{archivosDbf.respuest ? archivosDbf.respuest.name : "Sin archivo RESPUEST"}</p>
          <Button variant="outline" onClick={() => cargarArchivo("respuest")} disabled={!procesoCreado?.id || subiendo.respuest}>
            {subiendo.respuest ? "Subiendo..." : "Cargar Respuest"}
          </Button>
        </div>
        <div className="space-y-1">
          <Input type="file" accept=".dbf" onChange={seleccionarArchivoDbf("claves")} />
          <p className="text-xs text-muted-foreground">{archivosDbf.claves ? archivosDbf.claves.name : "Sin archivo CLAVES"}</p>
          <Button variant="outline" onClick={() => cargarArchivo("claves")} disabled={!procesoCreado?.id || subiendo.claves}>
            {subiendo.claves ? "Subiendo..." : "Cargar Claves"}
          </Button>
        </div>
        <Button disabled={!puedeProcesar}>
          Procesar examen habilitado
        </Button>
      </section>
    </div>
  );
};

export default NuevoProceso;
