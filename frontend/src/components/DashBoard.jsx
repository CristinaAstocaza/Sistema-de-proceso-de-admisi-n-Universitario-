import React, { useState } from 'react';
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
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const DashBoard = () => {
  const [userName] = useState('Juan Perez');
  const [userRole] = useState('Revisor');
  const [userEmail] = useState('juan.perez@example.com');

  const handleLogout = () => {
    console.log('Cerrando sesion...');
  };

  const sections = [
    { title: 'Nuevo Proceso', icon: Plus, to: '/nuevo-proceso' },
    { title: 'Gestión de Procesos', icon: FolderOpen, to: '/gestion-procesos' },
    { title: 'Observaciones', icon: Eye, to: '/observaciones' },
    { title: 'Anulados', icon: XCircle, to: '/anulados' },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">

        {/* SIDEBAR */}
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userRole}</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-auto">
            <SidebarMenu>
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <SidebarMenuItem key={index}>
                    <NavLink
                      to={section.to}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors 
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-accent hover:text-accent-foreground'}`
                      }
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{section.title}</span>
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t">
            <div className="space-y-3">
              <Separator />
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Usuario conectado:</p>
                <p className="font-medium truncate">{userEmail}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* CONTENIDO */}
        <div className="flex-1 flex flex-col">

          {/* HEADER */}
          <div className="border-b p-4 flex items-center gap-4 bg-background">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">
              Sistema de Revisión - San Luis
            </h1>
          </div>

          {/* a AQUi SE RENDERIZAN LAS PaGINAS */}
          <div className="flex-1 overflow-auto p-6 bg-background">
            <Outlet />
          </div>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashBoard;