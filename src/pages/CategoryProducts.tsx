
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Heart, BarChart2, ChevronRight, Filter, SortDesc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { categoryService, Product } from "@/services/api";

const CategoryProducts = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { toast } = useToast();
  const { addToCart, products } = useCart();
  
  // Default filters
  const [sortOrder, setSortOrder] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  
  // Convert the URL slug to a readable category name
  useEffect(() => {
    if (categorySlug) {
      const formattedName = categorySlug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      
      setCategoryName(formattedName);
      
      // Find products that match this category
      const matchingProducts = products.filter(product => 
        product.categoria?.nombre.toLowerCase() === formattedName.toLowerCase() ||
        product.categoria?.nombre.toLowerCase().includes(formattedName.toLowerCase()) ||
        formattedName.toLowerCase().includes(product.categoria?.nombre.toLowerCase())
      );
      
      setCategoryProducts(matchingProducts);
    }
  }, [categorySlug, products]);
  
  // Filter and sort products
  let filteredProducts = [...categoryProducts];
  
  // Apply price filter
  if (priceRange === "under-100") {
    filteredProducts = filteredProducts.filter(product => product.precio < 100);
  } else if (priceRange === "100-300") {
    filteredProducts = filteredProducts.filter(product => product.precio >= 100 && product.precio <= 300);
  } else if (priceRange === "above-300") {
    filteredProducts = filteredProducts.filter(product => product.precio > 300);
  }
  
  // Apply sorting
  if (sortOrder === "price-low") {
    filteredProducts.sort((a, b) => a.precio - b.precio);
  } else if (sortOrder === "price-high") {
    filteredProducts.sort((a, b) => b.precio - a.precio);
  } else if (sortOrder === "rating") {
    // Mock rating sort since we don't have ratings
    filteredProducts.sort((a, b) => (b.descuento || 0) - (a.descuento || 0));
  }
  
  const handleAddToCart = (productId: number) => {
    addToCart(productId, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <nav className="flex mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors">Categories</Link>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium">{categoryName}</span>
        </nav>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
          <p className="text-gray-600">
            Browse our selection of {categoryName.toLowerCase()} products.
          </p>
        </div>

        {/* Filters and sorting */}
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
          <div className="md:flex-1">
            <Button 
              variant="outline" 
              className="md:mr-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center">
              <SortDesc size={16} className="mr-2 text-gray-500" />
              <span className="text-sm text-gray-700 mr-2">Sort by:</span>
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter panel - expandable */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">Filter by Price</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="all-prices" 
                  name="price-range" 
                  value="all"
                  checked={priceRange === "all"}
                  onChange={() => setPriceRange("all")}
                  className="mr-2"
                />
                <label htmlFor="all-prices">All Prices</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="under-100" 
                  name="price-range" 
                  value="under-100"
                  checked={priceRange === "under-100"}
                  onChange={() => setPriceRange("under-100")}
                  className="mr-2"
                />
                <label htmlFor="under-100">Under $100</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="100-300" 
                  name="price-range"
                  value="100-300"
                  checked={priceRange === "100-300"}
                  onChange={() => setPriceRange("100-300")}
                  className="mr-2"
                />
                <label htmlFor="100-300">$100 - $300</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="above-300" 
                  name="price-range" 
                  value="above-300"
                  checked={priceRange === "above-300"}
                  onChange={() => setPriceRange("above-300")}
                  className="mr-2"
                />
                <label htmlFor="above-300">Above $300</label>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="relative h-48 overflow-hidden">
                  <Link to={`/producto/${product.id}`}>
                    <img 
                      src={`${import.meta.env.VITE_API_URL}imagenes/${product.image}`} 
                      alt={product.nombre} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  {!product.disponible && (
                    <div className="absolute top-3 left-3 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded">
                      Out of Stock
                    </div>
                  )}
                  {product.descuento > 0 && (
                    <div className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                      -{product.descuento}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <Link to={`/producto/${product.id}`} className="text-lg font-medium hover:text-primary transition-colors">
                    {product.nombre}
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
                    <span className="text-xs text-gray-500 ml-2">12 reviews</span>
                  </div>
                  <div className="mt-2 font-bold">
                    ${product.descuento ? (
                            product.precio - (product.precio *
                            (product.descuento / 100))
                          ).toFixed(2) : product.precio.toFixed(2)}
                    {product.descuento > 0 && (
                      <span className="text-gray-500 text-sm line-through ml-2">
                          $
                          {product.precio.toFixed(2)}
                        </span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      disabled={!product.disponible}
                      onClick={() => handleAddToCart(product.id as number)}
                    >
                      <ShoppingCart size={16} className="mr-1" />
                      Add to cart
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">We couldn't find any products matching your criteria.</p>
            <Button onClick={() => {setPriceRange("all"); setSortOrder("featured");}}>
              Reset Filters
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryProducts;
