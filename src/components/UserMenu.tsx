
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, ShoppingBag, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

export function UserMenu() {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openLoginModal = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthMode("register");
    setIsAuthModalOpen(true);
  };

  // Get the initial or fallback for user display
  const getUserInitial = () => {
    if (user?.username && user.username.length > 0) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const isAdmin = user?.rol === "Administrador";
  const isSeller = user?.rol === "Vendedor";

  return (
    <>
      {isAuthenticated && user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full ">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground p-4">
                {getUserInitial()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.username || "Usuario"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/perfil">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/pedidos">
              <DropdownMenuItem>
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Mis Pedidos</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={openLoginModal}
          >
            <span className="hidden md:inline">Ingresar</span>
            <LogIn size={16} className="md:ml-1" />
          </Button>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        initialMode={authMode}
      />
    </>
  );
}
