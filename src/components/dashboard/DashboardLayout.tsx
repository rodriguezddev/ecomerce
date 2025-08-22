import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  Truck, 
  FileText, 
  BarChart, 
  CreditCard, 
  Tag, 
  LogOut,
  Ship
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Category, categoryService } from "@/services/api";

export default function DashboardLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar roles
  const isAdmin = user?.rol === "Administrador";
  const isSeller = user?.rol === "Vendedor";

  // Si no está autenticado, redirigir a inicio
  if (!isAuthenticated) {
    navigate("/");
    toast({
      title: "Acceso denegado",
      description: "Debe iniciar sesión para acceder al panel de administración",
      variant: "destructive",
    });
    return null;
  }

  // Si no es administrador ni vendedor, denegar acceso
  if (!isAdmin && !isSeller) {
    navigate("/");
    toast({
      title: "Acceso denegado",
      description: "No tiene permisos para acceder al panel de administración",
      variant: "destructive",
    });
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Sesión cerrada",
      description: "Ha cerrado sesión correctamente",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="py-4 px-3 ">
              <h2 className="font-bold text-xl text-center">{user?.rol }</h2>
              <p className="text-sm text-center text-muted-foreground">{user?.username || "Usuario"}</p>
              <Link to="/" className="flex justify-center text-decoration">
                <span>Ir a home</span>
              </Link>
            </div>
            
            {(isAdmin) && (
              <SidebarGroup type="single">
                <SidebarGroupLabel>General</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard" className="flex">
                          <LayoutDashboard className="w-5 h-5 mr-2" />
                          <span>Resumen de ventas</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/reportes" className="flex">
                          <BarChart className="w-5 h-5 mr-2" />
                          <span>Reportes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup type="single">
              <SidebarGroupLabel>Gestión</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* 1. Usuarios */}
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/usuarios" className="flex">
                          <Users className="w-5 h-5 mr-2" />
                          <span>Usuarios</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* 2. Productos */}
                  {(isAdmin) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/productos" className="flex">
                          <Package className="w-5 h-5 mr-2" />
                          <span>Productos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* 3. Categorías */}
                  {(isAdmin) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/categorias" className="flex">
                          <Tag className="w-5 h-5 mr-2" />
                          <span>Categorías</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* 4. Métodos de pago */}
                  {(isAdmin) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/metodos-de-pago" className="flex">
                          <CreditCard className="w-5 h-5 mr-2" />
                          <span>Métodos de Pago</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* 5. Empresas de envío */}
                  {(isAdmin) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/empresas-envio" className="flex">
                          <Ship className="w-5 h-5 mr-2" />
                          <span>Empresas de Envío</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* 6. Pedidos */}
                  {(isAdmin || isSeller) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/pedidos" className="flex">
                          <ShoppingBag className="w-5 h-5 mr-2" />
                          <span>Pedidos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* 7. Pagos */}
                  {(isAdmin || isSeller) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/pagos" className="flex">
                          <CreditCard className="w-5 h-5 mr-2" />
                          <span>Pagos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* 8. Envíos */}
                  {(isAdmin || isSeller) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/envios" className="flex">
                          <Truck className="w-5 h-5 mr-2" />
                          <span>Envíos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {/* 9. Recibo de entrega */}
                  {(isAdmin || isSeller) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/recibo" className="flex">
                          <FileText className="w-5 h-5 mr-2" />
                          <span>Recibo de entrega</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup type="single" className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut className="w-5 h-5 mr-2" />
                      <span>Cerrar sesión</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b p-4">
            <div className="flex items-center justify-between md:justify-center">
              <div className="flex md:hidden">
                <SidebarTrigger />
              </div>
              
              <h1 className="text-xl font-bold text-center">Panel de Administración</h1>
              <div></div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}