import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes.jsx'

import { ThemeProvider } from "./context/themeContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos el enrutador con nuestro proveedor de tema */}
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)
