
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryService, Category } from "@/services/api";

interface MegaMenuProps {
  type: "categories" | "menu";
}

const MegaMenu = ({ type }: MegaMenuProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type === "categories") {
      const fetchCategories = async () => {
        try {
          const data = await categoryService.getCategories();
          setCategories(data);
          setLoading(false);
        } catch (err) {
          console.error("Error al cargar categorías:", err);
          setLoading(false);
        }
      };

      fetchCategories();
    }
  }, [type]);

  // Group categories into columns
  const groupCategories = (categories: Category[]) => {
    const columns = 4;
    const result = [];
    const itemsPerColumn = Math.ceil(categories.length / columns);
    
    for (let i = 0; i < columns; i++) {
      result.push(categories.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }
    
    return result;
  };

  const categoriesGrouped = groupCategories(categories);

  // Default categories if API fails
  const defaultCategories = [
    {
      title: "Partes de Carrocería",
      items: ["Parachoques", "Capós", "Parrillas", "Luces de niebla", "Manijas de puertas", "Fundas para auto", "Compuertas traseras"]
    },
    {
      title: "Interior",
      items: ["Tablero", "Medidores", "Consolas", "Asientos", "Volantes", "Alfombras"]
    },
    {
      title: "Motor y Transmisión",
      items: ["Filtros de aire", "Sensores de oxígeno", "Cubiertas de motor", "Kits de tiempo", "Inyectores de combustible", "Radiadores"]
    },
    {
      title: "Iluminación",
      items: ["Faros delanteros", "Luces traseras", "Luces de niebla", "Direccionales", "Kits de interruptores", "Luces diurnas"]
    }
  ];

  if (type === "categories") {
    if (loading || categories.length === 0) {
      return (
        <div className="mega-menu grid grid-cols-4 gap-8">
          {defaultCategories.map((category, index) => (
            <div key={index}>
              <h3 className="font-bold mb-3 text-gray-900">{category.title}</h3>
              <ul className="space-y-2">
                {category.items.map((item, idx) => (
                  <li key={idx}>
                    <Link to={`/category/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-600 hover:text-primary">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="mega-menu grid grid-cols-4 gap-8">
        {categoriesGrouped.map((column, colIndex) => (
          <div key={colIndex}>
            {column.length > 0 && (
              <>
                <h3 className="font-bold mb-3 text-gray-900">{column[0].nombre}</h3>
                <ul className="space-y-2">
                  {column.map((category) => (
                    <li key={category.id}>
                      <Link 
                        to={`/category/${category.nombre.toLowerCase().replace(/\s+/g, '-')}`} 
                        className="text-gray-600 hover:text-primary"
                      >
                        {category.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="mega-menu grid grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-3 text-gray-900">Cubiertas de Ruedas</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/product/wheel-cover-1" className="group">
              <div className="h-32 bg-gray-100 mb-2 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1605152276897-4f618f831968?w=800" 
                  alt="Cubierta de Rueda" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-sm font-medium group-hover:text-primary">Cubierta Gris Brillante 19"</p>
              <p className="text-primary font-semibold mt-1">$119.00</p>
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-3 text-gray-900">Transmisión</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/product/transmission-1" className="group">
              <div className="h-32 bg-gray-100 mb-2 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1486074051793-e41332bf18fc?w=800" 
                  alt="Transmisión" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-sm font-medium group-hover:text-primary">Kit de Embrague para Transmisión</p>
              <p className="text-primary font-semibold mt-1">$189.00</p>
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-3 text-gray-900">Mejores Marcas</h3>
          <ul className="space-y-2">
            <li><Link to="/brand/brandix" className="text-gray-600 hover:text-primary">Brandix</Link></li>
            <li><Link to="/brand/red-gate" className="text-gray-600 hover:text-primary">Red Gate</Link></li>
            <li><Link to="/brand/blocks" className="text-gray-600 hover:text-primary">Blocks</Link></li>
            <li><Link to="/brand/zoom-zoom" className="text-gray-600 hover:text-primary">Zoom Zoom</Link></li>
            <li><Link to="/brand/fast-wheels" className="text-gray-600 hover:text-primary">Fast Wheels</Link></li>
            <li><Link to="/brand/turbo-electric" className="text-gray-600 hover:text-primary">Turbo Electric</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3 text-gray-900">Ofertas especiales</h3>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-800">Venta de Primavera</p>
            <p className="font-bold text-lg text-gray-900 mt-1">Hasta 30% de descuento</p>
            <p className="text-xs text-gray-600 mt-1">Para todas las piezas de frenos - tiempo limitado</p>
            <Link to="/sale/spring" className="inline-block bg-primary text-white text-sm font-medium px-4 py-2 rounded mt-3 hover:bg-primary/90 transition-colors">
              Comprar Ahora
            </Link>
          </div>
        </div>
      </div>
    );
  }
};

export default MegaMenu;
