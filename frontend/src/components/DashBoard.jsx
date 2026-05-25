import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  FolderOpen,
  Eye,
  XCircle,
  LogOut,
  Plus,
  Moon,
  Sun
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/themeContext';
import logoSanLuis from '@/assets/logo-sanluis.png';

const DashBoard = () => {
  const [userName] = useState('Juan Perez');
  const [userRole] = useState('Revisor');
  const [userEmail] = useState('juan.perez@example.com');
  const navigate = useNavigate();

  // Traemos el estado del tema y la función para cambiarlo
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    console.log('Cerrando sesion...');
    localStorage.removeItem('auth_user');
    navigate('/login', { replace: true });
  };

  const sections = [
    { title: 'Nuevo Proceso', icon: Plus, to: '/nuevo-proceso' },
    { title: 'Gestión de Procesos', icon: FolderOpen, to: '/gestion-procesos' },
    { title: 'Observaciones', icon: Eye, to: '/observaciones' },
    { title: 'Anulados', icon: XCircle, to: '/anulados' },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

        {/* SIDEBAR */}
        <Sidebar className="fixed left-0 top-0 h-screen w-[280px] min-w-[280px] z-50 border-r border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[10px_0_35px_-18px_rgba(2,6,23,0.32)] transition-colors duration-300">
          <SidebarHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5 px-1">
              <img
                src={logoSanLuis}
                alt="Logo San Luis Gonzaga"
                className="h-[62px] w-[62px] object-contain rounded-lg"
              />
              <div className="min-w-0">
                <p className="font-bold text-lg leading-tight text-slate-800 dark:text-slate-100 truncate">Plataforma de Admisión</p>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 truncate">San Luis Gonzaga</p>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold shadow-sm text-sm">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userRole}</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-auto p-5">
            <div className="px-2 pb-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Secciones</p>
            </div>
            <SidebarMenu className="space-y-3">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <SidebarMenuItem key={index}>
                    <NavLink
                      to={section.to}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[1.03rem] font-semibold transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'}`
                      }
                    >
                      <IconComponent className="h-5 w-5 shrink-0" />
                      <span>{section.title}</span>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 transition-colors duration-300">
            <div className="space-y-5">
              <Separator className="bg-slate-100 dark:bg-slate-800" />
              <div className="text-sm px-1">
                <p className="text-slate-500 dark:text-slate-400 mb-1">Usuario conectado:</p>
                <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{userEmail}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full h-12 text-base text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 transition-colors"
                size="default"
              >
                <LogOut className="mr-2 h-[18px] w-[18px]" />
                Cerrar Sesión
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* CONTENIDO PRINCIPAL */}
        <div className="ml-[280px] min-h-screen flex-1 flex flex-col min-w-0">

          {/* HEADER SUPERIOR */}
          <header className="sticky top-0 h-20 border-b border-slate-200/80 dark:border-slate-800 px-8 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_12px_26px_-18px_rgba(15,23,42,0.35)] z-40 transition-colors duration-300">
            <div className="flex items-center gap-5">
              <SidebarTrigger className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors" />
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Dashboard Administrativo</p>
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                  Plataforma de Admisión San Luis Gonzaga
                </h1>
              </div>
            </div>

            {/* BOTÓN DE MODO OSCURO */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="h-11 w-11 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </header>

          {/* AQUÍ SE RENDERIZAN LAS PÁGINAS */}
          <main className="flex-1 p-8 bg-transparent transition-colors duration-300">
            <div className="w-full">
              <Outlet />
            </div>
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashBoard;
