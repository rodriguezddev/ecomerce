import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, DollarSign, Package, Layers, Percent } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) throw new Error("Product ID is required");
      return productService.getProductById(Number(id));
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error al cargar el producto:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del producto.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando detalles del producto...</div>;
  }

  if (isError || !product) {
    return <div className="text-red-500 text-center">Error al cargar los detalles del producto.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Detalles del Producto</h1>
        </div>
        <Button asChild>
          <Link to={`/dashboard/productos/editar/${product.id}`}>
            <Edit className="mr-2 h-4 w-4" /> Editar Producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 flex flex-col items-center">
            {product.image ? (
              <img
                src={`${import.meta.env.VITE_API_URL}imagenes/${product.image}`}
                alt={product.nombre}
                className="w-full max-w-sm h-auto object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Sin imagen</span>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
                <Badge variant="outline">{product.categoria?.nombre || 'Sin Categoría'}</Badge>
                <h2 className="text-2xl font-semibold mt-2">{product.nombre}</h2>
                <p className="text-sm text-muted-foreground">Código: {product.codigo}</p>
            </div>
            
            <p className="text-muted-foreground">{product.descripcion}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                <div className="flex items-start gap-3">
                    <DollarSign className="h-6 w-6 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-muted-foreground">Precio</p>
                        <p className="font-semibold text-lg">${product.precio?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Package className="h-6 w-6 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-muted-foreground">Stock</p>
                        <p className="font-semibold text-lg">{product.stock} unidades</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Percent className="h-6 w-6 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-muted-foreground">Descuento</p>
                        <p className="font-semibold text-lg">{product.descuento}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                    <p className="text-sm text-muted-foreground mb-2">Disponibilidad</p>
                    {product.disponible ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Disponible</Badge>
                    ) : (
                        <Badge variant="destructive">No Disponible</Badge>
                    )}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}