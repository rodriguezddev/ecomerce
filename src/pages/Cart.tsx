import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ChevronRight, ShoppingCart, Minus, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { apiBcv } from "@/services/api";
import { toast } from "@/hooks/use-toast";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [bdvPrice, setBdvPrice] = useState<number | null>(null);

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <nav className="flex mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium">Carrito</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">Tu carrito</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-8">
              Parece que todavía no has añadido ningún artículo a tu carrito.
            </p>
            <Link to="/">
              <Button>Comenzar a comprar</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={`${import.meta.env.VITE_API_URL}imagenes/${item.image}`}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="ml-4">
                                <Link 
                                  to={`/producto/${item.id}`} 
                                  className="font-medium text-gray-900 hover:text-primary transition-colors"
                                >
                                  {item.name}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-right text-sm text-gray-500">
                            {item.descuento 
                              ? `$${(item.price - (item.price * (item.descuento / 100))).toFixed(2)}`
                              : `$${item.price.toFixed(2)}`
                            }
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex justify-center">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="px-4 py-2 border-x border-gray-300 min-w-[2.5rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  aria-label="Aumentar cantidad"
                                  disabled={item.quantity >= item.stock + 1}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                            ${(
                              (item.descuento 
                                ? item.price * (1 - item.descuento / 100)
                                : item.price
                              ) * item.quantity
                            ).toFixed(2)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              aria-label="Eliminar artículo"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile List */}
                <div className="md:hidden">
                  {cart.map((item) => (
                    <div key={item.id} className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-3">
                            <img
                              src={`${import.meta.env.VITE_API_URL}imagenes/${item.image}`}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div>
                            <Link 
                              to={`/producto/${item.id}`} 
                              className="font-medium text-gray-900 hover:text-primary transition-colors block mb-1"
                            >
                              {item.name}
                            </Link>
                            <div className="text-sm text-gray-500">
                              {item.descuento 
                                ? `$${(item.price - (item.price * (item.descuento / 100))).toFixed(2)}`
                                : `$${item.price.toFixed(2)}`
                              }
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          aria-label="Eliminar artículo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Disminuir cantidad"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300 min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-sm font-medium">
                          ${(
                            (item.descuento 
                              ? item.price * (1 - item.descuento / 100)
                              : item.price
                            ) * item.quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-bold mb-4">Resumen del pedido</h2>

                <span className="text-lg font-bold">Bs {(getCartTotal() * bdvPrice).toFixed(2)}</span>

                <div className="flex justify-between mb-3 pt-3 border-t">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">${getCartTotal().toFixed(2)}</span>
                  
                </div>

                <div className="flex justify-between mb-6 pt-3 border-t">
                  <span className="text-lg font-bold text-gray-600">Total Bs</span>
                  <span className="text-lg font-bold text-gray-600">Bs {(getCartTotal() * bdvPrice).toFixed(2)}</span>
                  
                </div>

                <Link to="/checkout">
                  <Button className="w-full">Ir al resumen de compra</Button>
                </Link>

                <div className="text-center mt-6">
                  <Link to="/" className="text-primary hover:underline text-sm">
                    Continuar comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;