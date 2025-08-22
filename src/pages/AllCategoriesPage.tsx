import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/FeaturedProducts";
import { Card, CardContent } from "@/components/ui/card";
import { Category, categoryService } from "@/services/api";
import Header from "@/components/Header";

const AllCategoriesPage = () => {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        setCategoriesError("No se pudieron cargar las categorías");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const loading = productsLoading || loadingCategories;
  const error = productsError || categoriesError;

  console.log(products);
  console.log(categories);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Todas las Categorías</h1>
        {Array(3)
          .fill(0)
          .map((_, catIndex) => (
            <section key={catIndex} className="mb-12">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(4)
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
            </section>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Todas las Categorías</h1>
        <div className="bg-red-50 p-4 rounded-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Todas las Categorías</h1>
        {categories.map((category) => {
          const categoryProducts = products.filter(
            (p) => p.categoria?.id === category.id
          );
          if (categoryProducts.length === 0) {
            return null; // No mostrar categorías sin productos
          }
          return (
            <section key={category.id} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{category.nombre}</h2>
                <Link
                  to={`/categoria/${category.id}`}
                  className="text-primary hover:text-primary/80 flex items-center"
                >
                  Ver más
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryProducts.slice(0, 4).map((product) => (
                  product.stock > 0 && (
                  <ProductCard key={product.id} product={product} />
                  )
                ))}
              </div>
            </section>
          );
        })}
        {categories.length === 0 && !loading && (
          <div className="text-center py-10">
            <p>No se encontraron categorías.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCategoriesPage;
