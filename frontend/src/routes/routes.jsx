import App from "@/App";
import Anulados from "@/pages/private/Anulados";
import GestionProcesos from "@/pages/private/GestionProcesos";
import IndexPages from "@/pages/private/IndexPages";
import NuevoProceso from "@/pages/private/NuevoProceso";
import Observaciones from "@/pages/private/Observaciones";
import Login from "@/pages/public/Login";
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      <Route index element={<Navigate to="/login" replace />} />

      <Route path="login" element={<Login />} />

      <Route element={<IndexPages />}>
        <Route path="gestion-procesos" element={<GestionProcesos />} />
        <Route path="nuevo-proceso" element={<NuevoProceso />} />
        <Route path="observaciones" element={<Observaciones />} />
        <Route path="anulados" element={<Anulados />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Route>
  )
);

export default router;
