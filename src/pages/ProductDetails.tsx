import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Star, Minus, Plus, ShoppingCart, Heart, BarChart2, Truck, ArrowLeft } from "lucide-react";
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
              Back to Products
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
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors">Products</Link>
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

            <div className="border-t border-gray-200 pt-6 mb-6">
              <p className="text-gray-600 mb-6">
                {product.descripcion || "Sin descripción disponible."}
              </p>

              {/* Stock status */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 ${product.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${product.disponible ? "bg-green-500" : "bg-red-500"}`}></span>
                {product.disponible ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center mb-6">
              <span className="mr-4 text-gray-700 font-medium">Quantity:</span>
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
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <Heart size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <BarChart2 size={18} />
              </Button>
            </div>

            {/* Shipping info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <Truck className="text-primary mr-3 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium">Envíos Gratis</p>
                  <p className="text-sm text-gray-600">Delivery within 3-5 working days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-base py-3 px-6 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Descripción
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-base py-3 px-6 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Especificaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p>
                The {productName} is designed to meet or exceed OEM specifications, ensuring a perfect fit and optimal performance for your vehicle.
                Made from high-quality materials, this component is built to withstand the demands of daily use and provide reliable operation over time.
              </p>
              <p className="mt-4">
                Our engineering team has carefully designed this product to address common issues found in factory parts,
                resulting in improved durability and performance. Each unit undergoes rigorous testing and quality control
                to ensure it meets our strict standards before shipping.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Features:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Direct replacement for factory part</li>
                <li>Easy installation with standard tools</li>
                <li>Premium materials for enhanced durability</li>
                <li>Engineered to OEM specifications</li>
                <li>Tested for reliability and performance</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600">Brand</td>
                      <td className="py-3 font-medium">Brandix</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600">SKU</td>
                      <td className="py-3 font-medium">BDX-{product.id}00{product.id}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600">Weight</td>
                      <td className="py-3 font-medium">{(Math.random() * 10 + 1).toFixed(2)} kg</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-600">Dimensions</td>
                      <td className="py-3 font-medium">{Math.floor(Math.random() * 30 + 10)}×{Math.floor(Math.random() * 20 + 5)}×{Math.floor(Math.random() * 15 + 5)} cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Compatibility</h3>
                <p className="mb-4 text-gray-600">This product is compatible with the following vehicle models:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Toyota Camry (2018-2023)</li>
                  <li>• Toyota Corolla (2019-2023)</li>
                  <li>• Toyota RAV4 (2018-2022)</li>
                  <li>• Lexus ES (2018-2022)</li>
                  <li>• Lexus RX (2016-2022)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related products section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
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
                  <div className="p-4">
                    <Link to={`/producto/${relatedProduct.id}`} className="text-lg font-medium hover:text-primary transition-colors">
                      {relatedProduct.nombre}
                    </Link>
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">12</span>
                    </div>
                    <div className="mt-2 font-bold">
                      ${relatedProduct.precio.toFixed(2)}
                    </div>
                  </div>
                </div>
              )) :
              <div className="col-span-4 text-center py-8">
                <p>No related products found.</p>
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