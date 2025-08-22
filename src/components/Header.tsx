import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, Heart, Phone, MapPin, Truck, ChevronDown, LayoutDashboard, SquareChartGantt } from "lucide-react";
import { Input } from "@/components/ui/input";
import logo from "@/assets/M&C7_logo_negro.png";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/context/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { apiBcv, Category, categoryService } from "@/services/api";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bdvPrice, setBdvPrice] = useState<number | null>(null);
  const { getCartCount } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        setError("No se pudieron cargar las categorías");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

    useEffect(() => {
      apiBcv.getBcvPrice()
        .then((response) => {
          if (response) {
            const bcvPrice = response.promedio;
            setBdvPrice(bcvPrice);
          } else {
            console.error("BCV price not found in response");
          }
        })
        .catch((error) => {
          console.error("Error fetching BCV price:", error);
          toast({
            title: "Error", // Already translated
            description: "No se pudo obtener el precio del BCV. Por favor, inténtalo de nuevo más tarde.", // Already translated
            variant: "destructive",
          });
        })
    }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality here
  };

  // Check if user is admin or seller
  const isAdmin = user?.rol === "Administrador";
  const isSeller = user?.rol === "Vendedor";
  const canAccessDashboard = isAdmin || isSeller;

  return (
    <header className="bg-white">
      {/* Top Bar */}
      <div className="py-0 hidden md:block">
        <div style={{
            'background': 'linear-gradient(270deg,rgba(51, 51, 51, 1) 50%,rgba(229, 39, 39, 1) 50%)'
          }}>
        <div 
          className="container mx-auto px-0 py-0 flex justify-between items-center text-sm bg-white" 
        >
          {/* Phone */}
          <div 
            className="flex items-center space-x-6 justify-center " 
            style={{
              'backgroundColor': '#e52727',
              'padding': '0.5em 8em 0.5em 0em',
              'clipPath': 'polygon(0 0, 100% 0, 94% 100%, 0 100%)',
              'width': '40%',
              'color': '#fff'
            }}
          >
            <div className="flex items-center pl-6 ">
              
              <span style={{fontWeight: '700'}}>
  Tasa del día: {bdvPrice ? bdvPrice.toFixed(2) : 'N/A'} BS
</span>
            </div>
            {/* <div className="flex items-center">
              <MapPin size={16} className="text-primary mr-1 text-white" />
              <span>Encontrar tienda</span>
            </div> */}
            {/* <div className="hidden lg:flex items-center">
              <Truck size={16} className="text-primary mr-1 text-white" />
              <span>Rastrear Pedido</span>
            </div> */}
          </div>
          <div className="text-sub-header">REPUESTOS Y  ACCESORIOS </div>
          <div 
            className="flex items-center space-x-6"
            style={{
              'backgroundColor': '#333', 
              'padding': '0.5em 0em 0.5em 8em',
              'clipPath': 'polygon(0 0, 100% 0, 100% 100%, 6% 100%)',
              'width': '40%',
              'color': '#fff'
            }}
          >
            {/* <Link to="/track-order" className="hover:text-primary transition-colors">Rastrear Pedido</Link> */}
            <Link target="_blank" to="https://www.google.com/maps/place/Repuestos+y+Accesorios+M%26C7+c.a/@10.2635038,-68.0150525,17z/data=!4m14!1m7!3m6!1s0x8e805df26dfafea5:0xfe40bcafdbcd67be!2sRepuestos+y+Accesorios+M%26C7+c.a!8m2!3d10.2636188!4d-68.0150729!16s%2Fg%2F11vlngplmh!3m5!1s0x8e805df26dfafea5:0xfe40bcafdbcd67be!8m2!3d10.2636188!4d-68.0150729!16s%2Fg%2F11vlngplmh?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D" className="hover:text-primary transition-colors">Av Bolívar de Naguanagua, frente a Residencias Bella Vista</Link>
            {/* <Link to="/help" className="hover:text-primary transition-colors pr-6">Ayuda</Link> */}
          </div>
        </div>
        </div>
        
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img src={logo} alt="M&C7 Logo" className="h-12" />
          </Link>

          <Link to="/productos" className="flex flex-col items-center text-gray-600 hover:text-primary">
                <div className="relative">
                  <SquareChartGantt size={24}/>
                </div>
                <span className="text-xs mt-1 hidden sm:block">Productos</span>
              </Link>
          
          {/* Search */}
          <div className="hidden md:block flex-1 max-w-xl ml-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input 
                  className="pr-10 rounded-md border-gray-300" 
                  placeholder="Buscar repuestos o categorias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  variant="default" 
                  className="absolute right-0 top-0 h-full rounded-l-none"
                  type="submit"
                >
                  <Search size={18} />
                </Button>
              </div>
            </form>
          </div>
          
          {/* User Controls */}
          <div className="flex items-center space-x-8">
            {/* Dashboard shortcut for Admin/Seller */}
            {canAccessDashboard && (
              <Link to={`${isAdmin ? '/dashboard' : '/dashboard/pedidos'}`} className="flex flex-col items-center text-gray-600 hover:text-primary">
                <div className="relative">
                  <LayoutDashboard size={22} />
                </div>
                <span className="text-xs mt-1 hidden sm:block">Panel de Administración</span>
              </Link>
            )}

            <Link to="/carrito" className="flex flex-col items-center text-gray-600 hover:text-primary">
              <div className="relative">
                <ShoppingCart size={22} />
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              </div>
              <span className="text-xs mt-1 hidden sm:block">Carrito</span>
            </Link>
            
            {/* User Menu (Login/Register or User Profile) */}
            <UserMenu />
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600 ml-4" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      
      {/* Mobile Menu */}
      {isMenuOpen && (
  <div className="md:hidden bg-white border-t">
    <div className="p-4">
      <div className="relative mb-4">
        <Input 
          className="pr-10" 
          placeholder="Buscar repuestos o categorias..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button 
          variant="ghost" 
          className="absolute right-0 top-0 h-full px-3"
          type="button"
          onClick={handleSearch}
        >
          <Search size={18} />
        </Button>
      </div>
      
      <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
                    {
                      categories.map((category) => (
                        <Link to={`/category/${category.id}`} key={category.id} className="block p-
                        2 hover:bg-gray-100">
                          {category.nombre}
                        </Link>
                      ))
                    }
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link to="/categories" className="text-primary font-medium hover:underline">
                      Ver todas las categorias
                    </Link>
                  </div>
        
        <Link to="/" className="block py-2 px-3 hover:bg-gray-50 rounded-md">Inicio</Link>
        
        <div className="pt-4 mt-4 border-t border-gray-200"></div>
        
        <div className="py-2 px-3 font-medium">Mi Cuenta</div>
        <UserMenu mobileView />
      </div>
    </div>
  </div>
)}
    </header>
  );
};

export default Header;
