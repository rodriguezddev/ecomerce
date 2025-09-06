import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService, Product, apiBcv } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Eye, DollarSign, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Agregar useNavigate
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductList() {
  const { toast } = useToast();
  const navigate = useNavigate(); // Agregar navigate
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [bdvPrice, setBdvPrice] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getProducts,
  });

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
          title: "Error",
          description: "No se pudo obtener el precio del BCV. Por favor, inténtalo de nuevo más tarde.",
          variant: "destructive",
        });
      })
  }, []);

  const calcularPrecioConDescuento = (producto: Product) => {
    const precioBase = producto.precio || 0;
    
    // Priorizar descuento del producto si existe
    if (producto.descuento && producto.descuento > 0) {
      return precioBase * (1 - producto.descuento / 100);
    }
    
    // Si no tiene descuento el producto, aplicar el de la categoría
    if (producto.categoria?.descuento && producto.categoria.descuento > 0) {
      return precioBase * (1 - producto.categoria.descuento / 100);
    }
    
    return precioBase;
  };

  const confirmDelete = (id: number) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (productToDelete === null) return;

    try {
      await productService.deleteProduct(productToDelete);
      
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      });
      refetch();
      // Adjust current page if deleting the last item on the page
      if (paginatedProducts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    } finally {
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Eliminada la función handleCreateSuccess ya que no se usa con modal

  const filteredProducts = data?.filter((product: Product) => 
    product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredProducts?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts?.slice(startIndex, endIndex) || [];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Contar productos con stock bajo (solo en la página actual)
  const productosConStockBajo = paginatedProducts?.filter(
    (product: Product) => (product.stock || 0) < 3
  ).length || 0;

  if (isLoading) {
    return <div>Cargando productos...</div>;
  }

  if (isError) {
    return <div>Error al cargar productos</div>;
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <h1 className="text-3xl font-bold mb-6 md:col-span-3 sm:col-span-1 mt-3">Gestión de productos</h1>
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
            <CardTitle className="text-sm font-medium">
              Tasa del Día (BCV)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              {bdvPrice ? `Bs. ${bdvPrice}` : "Cargando..."}
            </div>
            <p className="text-xs text-muted-foreground">Precio del Dólar oficial.</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Alerta de stock bajo */}
      {productosConStockBajo > 0 && (
        <div className="mb-4 p-3 rounded-md bg-red-100/80 border border-red-300 text-red-800 flex items-center">
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <span>
            {productosConStockBajo === 1 
              ? "Hay 1 producto que necesita reposición" 
              : `Hay ${productosConStockBajo} productos que necesitan reposición`}
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>
        
        {/* Cambiar el botón para redirigir a la vista de creación */}
        <Button asChild>
          <Link to="/dashboard/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardContent>
          {filteredProducts?.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio USD</TableHead>
                    <TableHead>Precio BS</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Disponible</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product: Product) => {
                    const precioConDescuento = calcularPrecioConDescuento(product);
                    const precioBs = bdvPrice ? precioConDescuento * bdvPrice : 0;
                    const precioOriginalBs = bdvPrice ? (product.precio || 0) * bdvPrice : 0;
                    const tieneDescuento = product.descuento || product.categoria?.descuento;
                    const porcentajeDescuento = product.descuento || product.categoria?.descuento;
                    const stockBajo = (product.stock || 0) < 3;

                    return (
                      <TableRow 
                        key={product.id}
                        className={stockBajo ? "bg-red-50 hover:bg-red-100" : ""}
                      >
                        <TableCell className="font-medium">{product.codigo}</TableCell>
                        <TableCell>
                          {product.image && (
                            <img 
                              src={`${import.meta.env.VITE_API_URL}imagenes/${product.image}`}
                              alt={product.nombre} 
                              className="w-12 h-12 object-cover rounded" 
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {stockBajo ? (
                            <span className="text-red-600 font-medium">{product.nombre}</span>
                          ) : (
                            product.nombre
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={tieneDescuento ? "line-through text-gray-500 text-sm" : ""}>
                              {product.precio?.toFixed(2)} $
                            </span>
                            {tieneDescuento && (
                              <span className="font-medium">
                                {precioConDescuento.toFixed(2)} $
                                <span className="text-xs text-green-600 ml-1">
                                  ({porcentajeDescuento}% desc.)
                                </span>
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={tieneDescuento ? "line-through text-gray-500 text-sm" : ""}>
                              {precioOriginalBs.toFixed(2)} Bs
                            </span>
                            {tieneDescuento && (
                              <span className="font-medium">
                                {precioBs.toFixed(2)} Bs
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={stockBajo ? "text-red-600 font-medium" : ""}>
                          {product.stock}
                          {stockBajo && (
                            <span className="ml-1 text-xs text-red-500">(bajo stock)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.categoria?.nombre}
                          {product.categoria?.descuento && !product.descuento && (
                            <span className="text-xs text-green-600 ml-1">
                              ({product.categoria.descuento}% desc.)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{product.disponible ? "Sí" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/dashboard/productos/${product.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog open={isDeleteDialogOpen && productToDelete === product.id} onOpenChange={setIsDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete(product.id!)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el producto de nuestros servidores.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={executeDelete}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} productos
                    </p>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}