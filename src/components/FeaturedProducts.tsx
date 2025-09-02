
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, BarChart2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiBcv } from "@/services/api";

export const ProductCard = ({ product }) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [bdvPrice, setBdvPrice] = useState<number | null>(null);

  const handleAddToCart = () => {
    if (product.id) {
      addToCart(product.id, 1);
      toast({
        title: "Agregado al carrito",
        description: `${product.nombre} ha sido agregado a tu carrito.`,
      });
    }
  };

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
            title: "Error de Precio",
            description: "No se pudo obtener el precio del BCV. Por favor, inténtalo de nuevo más tarde.",
            variant: "destructive",
          });
        });
    }, []);

  return (
    <Card className="product-card overflow-hidden transition-all hover:shadow-md">
      <div className="product-card__image relative">
        <Link to={`/producto/${product.id}`}>
          <img
            src={`${import.meta.env.VITE_API_URL}imagenes/${product.image}`}
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
        <Link to={`/producto/${product.id}`} className="product-card__name text-lg font-medium hover:text-primary transition-colors">
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
            onClick={handleAddToCart}
          >
            <ShoppingCart size={16} className="mr-1" />
            Agregar al carrito
          </Button>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Heart size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <BarChart2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturedProducts = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const { products, loading, error } = useCart();

  const getCategoryProducts = (categoryName) => {
    return products.filter(
      product => product.categoria?.nombre === categoryName
    );
  };

  const trendingProducts = getCategoryProducts(activeTab) || [];

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="section-title text-2xl font-bold w-5/6 mb-0">Catálogo</h2>
            <Link to="/productos" className="text-primary hover:text-primary/80 flex items-center justify-end w-1/6">
              Ver todos los productos
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
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
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="section-title text-2xl font-bold w-5/6 mb-0">Catálogo</h2>
            <Link to="/productos" className="text-primary hover:text-primary/80 flex items-center justify-end w-1/6">
              Ver todos los productos
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        <div className="bg-red-50 p-4 rounded-lg text-red-500">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
            <h2 className="section-title text-2xl font-bold w-5/6 mb-0">Catálogo</h2>
            <Link to="/productos" className="text-primary hover:text-primary/80 flex items-center justify-end w-1/6">
              Ver todos los productos
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
      <Tabs defaultValue="trending" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-6">
          <TabsList>
    <TabsTrigger value="trending">Tendencias</TabsTrigger>
    <TabsTrigger value="special">Ofertas especiales</TabsTrigger>
    <TabsTrigger value="bestsellers">Más vendidos</TabsTrigger>
</TabsList>
        </div>

        <TabsContent value="trending" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.slice(0, 8).map((product) => (
                product.stock > 0 && (
                <ProductCard key={product.id} product={product} />
                )
              ))
            ) : (
              <div className="col-span-4 text-center py-10">
                <p>No products available in this category.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.filter(p => p.descuento > 0).slice(0, 8).map((product) => (
              product.stock > 0 && (
              <ProductCard key={product.id} product={product} />
              )
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bestsellers" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              product.stock > 0 && (
              <ProductCard key={product.id} product={product} />
              )
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default FeaturedProducts;