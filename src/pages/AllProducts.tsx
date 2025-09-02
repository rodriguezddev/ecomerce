import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  BarChart2,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiBcv, categoryService, productService } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bdvPrice, setBdvPrice] = useState<number | null>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(
          "No se pudieron cargar los productos. Por favor, inténtelo de nuevo más tarde."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product.id, 1);
    toast({
      title: "Añadido al carrito",
      description: `${product.nombre} ha sido añadido a tu carrito.`,
    });
  };

  // Filtrar productos por categoría
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.categoria.id === selectedCategory);

  // Ordenar productos basado en la opción seleccionada
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.precio - b.precio;
      case "price-high":
        return b.precio - a.precio;
      case "name-asc":
        return a.nombre.localeCompare(b.nombre);
      case "name-desc":
        return b.nombre.localeCompare(a.nombre);
      default:
        return 0;
    }
  });

  useEffect(() => {
    apiBcv
      .getBcvPrice()
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
          title: "Error",
          description: "Failed to fetch BCV price. Please try again later.",
          variant: "destructive",
        });
      });
  }, []);

  // Obtener productos actuales para paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Resetear paginación cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs mb-6">
          <ul className="flex space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-primary">
                Inicio
              </Link>
            </li>
            <li className="text-gray-800">/ Catálogo</li>
          </ul>
        </div>

        <h1 className="text-3xl font-bold mb-6">Catálogo</h1>

        {/* Filtros y ordenamiento */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center gap-2">
            {/* Filtro por categoría */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  {selectedCategory === "all" ? "Todas las categorías" : 
                   categories.find(cat => cat.id === selectedCategory)?.nombre || "Categoría"}
                  <ChevronDown size={14} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
                  Todas las categorías
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category.id} 
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.nombre}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Contador de productos */}
            <span className="text-sm text-gray-600 ml-2">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== "all" && ` en ${categories.find(cat => cat.id === selectedCategory)?.nombre}`}
            </span>
          </div>

          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600">Ordenar por:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {sortBy === "default" && "Destacados"}
                  {sortBy === "price-low" && "Precio: Bajo a Alto"}
                  {sortBy === "price-high" && "Precio: Alto a Bajo"}
                  {sortBy === "name-asc" && "Nombre: A-Z"}
                  {sortBy === "name-desc" && "Nombre: Z-A"}
                  <ChevronDown size={14} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("default")}>
                  Destacados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-low")}>
                  Precio: Bajo a Alto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-high")}>
                  Precio: Alto a Bajo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                  Nombre: A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                  Nombre: Z-A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-500">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay productos en esta categoría
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory !== "all" 
                ? `No encontramos productos en la categoría "${categories.find(cat => cat.id === selectedCategory)?.nombre}"`
                : "No hay productos disponibles en este momento"}
            </p>
            {selectedCategory !== "all" && (
              <Button onClick={() => setSelectedCategory("all")}>
                Ver todas las categorías
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <Card
                  key={product.id}
                  className="product-card overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="product-card__image relative">
                    <Link to={`/producto/${product.id}`}>
                      <img
                        src={
                          product.image
                            ? `${import.meta.env.VITE_API_URL}imagenes/${product.image}`
                            : "https://via.placeholder.com/300"
                        }
                        alt={product.nombre}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    {!product.disponible && (
                      <div className="absolute top-3 left-3 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Agotado
                      </div>
                    )}
                    {product.descuento > 0 && (
                      <Badge className="absolute top-3 left-3 bg-primary">
                        {`-${product.descuento}%`}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Link
                      to={`/producto/${product.id}`}
                      className="product-card__name text-lg font-medium hover:text-primary transition-colors"
                    >
                      {product.nombre}
                    </Link>
                    
                    <div className="product-card__price mt-2 font-bold">
                      ${product.descuento ? (
                            product.precio - (product.precio *
                            (product.descuento / 100))
                          ).toFixed(2) : product.precio.toFixed(2)}
                      {bdvPrice !== null && (
                        <div>
                          <span className="text-sm text-gray-500">
                            {((product.precio - (product.precio *
                            (product.descuento / 100))) * bdvPrice).toFixed(2)} BS
                          </span>
                        </div>
                      )}
                      {product.descuento > 0 && (
                        <span className="text-gray-500 text-sm line-through ml-2">
                          $
                          {product.precio.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="product-card__actions flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        disabled={!product.disponible || product.stock <= 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart size={16} className="mr-1" />
                        Agregar al carrito
                      </Button>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Heart size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <BarChart2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </PaginationLink>
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationLink
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllProducts;