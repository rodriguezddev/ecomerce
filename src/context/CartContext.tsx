
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Product, productService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  descuento: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getCartTotalSinDescuento: () => number;
  products: Product[];
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast({
        title: "Error",
        description: "Producto no encontrado",
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) { // Existing toast, checking for translation
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
      toast({
        title: "Updated cart",
        description: `La cantidad de ${product.nombre} ha sido actualizada en tu carrito.`,
      }); // Existing toast, checking for translation
    } else {
      setCart([...cart, {
        id: product.id as number,
        name: product.nombre,
        price: product.precio,
        image: product.image,
        descuento: product.descuento,
        quantity: quantity,
      }]);
      toast({
        title: "Agregado al carrito",
        description: `${product.nombre} ha sido agregado a tu carrito.`,
      });
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
    toast({ // Existing toast, checking for translation
      title: "Eliminado del carrito",
      description: "El artículo ha sido eliminado de tu carrito.",
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    toast({ // Existing toast, checking for translation
      title: "Carrito vaciado",
      description: "Todos los artículos han sido eliminados de tu carrito.",
    });
  };

const getCartTotal = () => {
  return cart.reduce((total, item) => {
    const price = item.descuento 
      ? (item.price - (item.price * (item.descuento / 100)))
      : item.price;
    return total + (price * item.quantity);
  }, 0);
};

const getCartTotalSinDescuento = () => {
  return cart.reduce((total, item) => {
    const price = item.price
    return total + (price * item.quantity);
  }, 0);
}

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getCartTotalSinDescuento,
      products,
      loading,
      error
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}