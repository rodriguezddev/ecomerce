
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { apiBcv } from "@/services/api";
import { toast } from "@/hooks/use-toast";

// Static offers
const offers = [
  {
    id: 1,
    title: "Aceites para Motor",
    discount: "Ahorra hasta 25%",
    image: "https://images.unsplash.com/photo-1620396962650-c0e3f6850742?w=500&h=300&fit=crop",
    link: "/category/engine-drivetrain",
    color: "bg-blue-700",
  },
  {
    id: 2,
    title: "Mejores Neumáticos",
    discount: "30% De Descuento",
    image: "https://images.unsplash.com/photo-1595951960047-2c77d80a9747?w=500&h=300&fit=crop",
    link: "/category/wheels-tires",
    color: "bg-red-600",
  },
];

const SpecialOffers = () => {
  const { addToCart, products, loading, error } = useCart();
  const [bdvPrice, setBdvPrice] = useState<number | null>(null);

  // Get discounted products for special offers
  const discountedProducts = products
    .filter(product => product.descuento > 0 && product.stock > 0)
    .sort((a, b) => b.descuento - a.descuento)
    .slice(0, 2);

  const handleAddToCart = (productId: number) => {
    addToCart(productId, 1);
  };

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

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="section-title text-2xl font-bold mb-6">Ofertas especiales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <h2 className="section-title text-2xl font-bold mb-6">Ofertas especiales</h2>
        <div className="bg-red-50 p-4 rounded-lg text-red-500">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      {/* Featured Discounted Products */}
      {discountedProducts.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl fo nt-semibold mb-4">Productos con Descuentos Más Altos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {discountedProducts.map(product => (
                <Card key={product.id} className="flex overflow-hidden shadow-sm hover:shadow-md">
                <div className="w-1/3">
                  <Link to={`/producto/${product.id}`}>
                    <img
                      src={`${import.meta.env.VITE_API_URL}imagenes/${product.image}`}
                      alt={product.nombre}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </div>
                <CardContent className="w-2/3 p-4">
                  <div className="flex justify-between items-start">
                    <Link to={`/producto/${product.id}`} className="text-lg font-medium hover:text-primary transition-colors">
                      {product.nombre}
                    </Link>
                    <div className="bg-primary text-white text-xs font-bold rounded-full px-2 py-1">
                      -{product.descuento}%
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-bold text-lg">${product.descuento ? (
                            product.precio - (product.precio *
                            (product.descuento / 100))
                          ).toFixed(2) : product.precio.toFixed(2)}</span>
                    {product.descuento > 0 && (
                        <span className="text-gray-500 text-sm line-through ml-2">
                          $
                          {product.precio.toFixed(2)}
                        </span>
                      )}

                      <div>
                  {bdvPrice !== null && (
                    <span className="text-sm text-gray-500">
                            {((product.precio - (product.precio *
                            (product.descuento / 100))) * bdvPrice).toFixed(2)} BS
                          </span>
                  )}
                </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.descripcion}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs mt-3"
                    disabled={!product.disponible || product.stock <= 0}
                    onClick={() => handleAddToCart(product.id as number)}
                  >
                    <ShoppingCart size={16} className="mr-1" />
                    Añadir al carrito
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SpecialOffers;
