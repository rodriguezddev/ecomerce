
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryService, Category } from "@/services/api";

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample images for categories since API doesn't provide images
  const categoryImages = {
    "Ruedas y Neumáticos": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&h=250&fit=crop",
    "Motor y Transmisión": "https://images.unsplash.com/photo-1486389440020-529294b09a7f?w=500&h=250&fit=crop",
    "Partes Interiores": "https://images.unsplash.com/photo-1559272279-9f64af07c96f?w=500&h=250&fit=crop",
    "Partes de Carrocería": "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=500&h=250&fit=crop",
    "Iluminación": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&h=250&fit=crop",
    "Rendimiento": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&h=250&fit=crop",
  };

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

  // Fallback to static categories if API fails
  const staticCategories = [
    {
      id: 1,
      nombre: "Ruedas y Neumáticos",
      descuento: 0,
      count: 367,
    },
    {
      id: 2,
      nombre: "Motor y Transmisión",
      descuento: 0,
      count: 279,
    },
    {
      id: 3,
      nombre: "Partes Interiores",
      descuento: 0,
      count: 204,
    },
    {
      id: 4,
      nombre: "Partes de Carrocería",
      descuento: 0,
      count: 185,
    },
    {
      id: 5,
      nombre: "Iluminación",
      descuento: 0,
      count: 162,
    },
    {
      id: 6,
      nombre: "Rendimiento",
      descuento: 0,
      count: 140,
    },
  ];

  const displayCategories = categories.length > 0 ? categories : staticCategories;

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="section-title text-2xl font-bold mb-6">Categorías</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-40 rounded-md"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="section-title text-2xl font-bold mb-6">Categorías</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayCategories.map((category) => (
           <div key={category.id} className="p-4 text-center">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {category.nombre}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {typeof category.productos === 'object' && category.productos ? category.productos.length : '0'} Productos
              </p>
            </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
