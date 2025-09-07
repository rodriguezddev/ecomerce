import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Star, Minus, Plus, ShoppingCart, Heart, BarChart2, Truck, ArrowLeft, Badge } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { productService, Product, apiBcv } from "@/services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart, products } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bdvPrice, setBdvPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (!id) return;
        const productId = parseInt(id);
        if (isNaN(productId)) {
          setError("Invalid product ID");
          setLoading(false);
          return;
        }

        const data = await productService.getProductById(productId);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to fetch product details");
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Link to="/" className="text-gray-500 hover:text-primary transition-colors">
              <ArrowLeft size={20} className="inline mr-2" />
              Volve al Catálogo
            </Link>
          </div>
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="mb-8">{error || "The product you are looking for does not exist or has been removed."}</p>
            <Link to="/">
              <Button>Return to Homepage</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Default values for missing product properties
  const productReviews = product?.reviews || 12;
  const productRating = product?.rating || 4;
  const productName = product?.name || product?.nombre;

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product.id as number, quantity);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Get related products
  const relatedProducts = products
    .filter(p => p.id !== product?.id && p.categoria?.id === product?.categoria?.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <nav className="flex mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors">Catálogo</Link>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium">{product.nombre}</span>
        </nav>

        {/* Product details section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product images */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={`${import.meta.env.VITE_API_URL}imagenes/${product.image}`}
              alt={product.nombre}
              className="w-full h-full object-contain p-8"
            />
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.nombre}</h1>

            

            {/* Product price */}
            <div className="mb-6">
              <div>
                <span className="text-3xl font-bold text-primary">${product.descuento ? (
                            product.precio - (product.precio *
                            (product.descuento / 100))
                          ).toFixed(2) : product.precio.toFixed(2)}</span>
                <div>
                  {bdvPrice !== null && (
                    <span className="text-sm text-gray-500">
                            {((product.precio - (product.precio *
                            (product.descuento / 100))) * bdvPrice).toFixed(2)} BS
                          </span>
                  )}
                </div>
                
              </div>
              
              {product.descuento > 0 && (
                <div>
                  {product.descuento > 0 && (
                      <span className="text-gray-500 text-sm line-through ml-2">
                          $
                          {product.precio.toFixed(2)}
                        </span>
                    )}

                  
                </div>
                
              )}
            </div>

            <div className="border-t border-gray-200 pt-2 mb-2">
              <p className="text-gray-600 mb-2">
                {product.descripcion || "Sin descripción disponible."}
              </p>

              {/* Stock status */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 ${product.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${product.disponible ? "bg-green-500" : "bg-red-500"}`}></span>
                {product.disponible ? "Disponible" : "No disponible"}
              </div>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center mb-6">
              <span className="mr-4 text-gray-700 font-medium">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                <button
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                className="flex-1 lg:flex-none lg:min-w-[200px]"
                disabled={!product.disponible}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} className="mr-2" />
                Agregar al carrito
              </Button>
             
            </div>

          
          </div>
        </div>


        {/* Related products section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Catálogo relacionado</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.length > 0 ?
              relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <Link to={`/producto/${relatedProduct.id}`} className="block h-48 overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_URL}imagenes/${relatedProduct.image}`}
                      alt={relatedProduct.nombre}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </Link>
                  {!relatedProduct.disponible && (
                            <div className="absolute top-3 left-3 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded">
                              Agotado
                            </div>
                          )}
                          {relatedProduct.descuento > 0 && (
                            <Badge className="absolute top-3 left-3 bg-primary">
                              {`-${relatedProduct.descuento}%`}
                            </Badge>
                          )}
                  <div className="p-4">
                    <Link to={`/producto/${relatedProduct.id}`} className="text-lg font-medium hover:text-primary transition-colors">
                      {relatedProduct.nombre}
                    </Link>
                    <div className="product-card__price mt-2 font-bold">
                      ${relatedProduct.descuento ? (
                            relatedProduct.precio - (relatedProduct.precio *
                            (relatedProduct.descuento / 100))
                          ).toFixed(2) : relatedProduct.precio.toFixed(2)}
                      {bdvPrice !== null && (
                        <div>
                          <span className="text-sm text-gray-500">
                            {((relatedProduct.precio - (relatedProduct.precio *
                            (relatedProduct.descuento / 100))) * bdvPrice).toFixed(2)} BS
                          </span>
                        </div>
                      )}
                      {relatedProduct.descuento > 0 && (
                        <span className="text-gray-500 text-sm line-through ml-2">
                          $
                          {relatedProduct.precio.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )) :
              <div className="col-span-4 text-center py-8">
                <p>No hay productos relacionados.</p>
              </div>
            }
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;