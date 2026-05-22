import App from "@/App";
import Anulados from "@/pages/private/Anulados";
import GestionProcesos from "@/pages/private/GestionProcesos";
import IndexPages from "@/pages/private/IndexPages";
import NuevoProceso from "@/pages/private/NuevoProceso";
import Observaciones from "@/pages/private/Observaciones";
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* Layout */}
      <Route path="/" element={<IndexPages />}>

        {/* Ruta por defecto */}
        <Route index element={<GestionProcesos />} />

        {/* Hijas */}
        <Route path="gestion-procesos" element={<GestionProcesos />} />
        <Route path="nuevo-proceso" element={<NuevoProceso />} />
        <Route path="observaciones" element={<Observaciones />} />
        <Route path="anulados" element={<Anulados />} />

      </Route>

    </Route>
  )
);

export default router;