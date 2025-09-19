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
  stock: number; // ← Añadir stock al interface CartItem
  categoriaDescuento: number;
  aplicarDescuentoCategoria: boolean;
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
  clearCartCheck: () => void;
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

    if (existingItem) {
      // Validar stock al añadir más cantidad
      if (existingItem.quantity + quantity > product.stock) {
        toast({
          title: "Stock insuficiente",
          description: `No hay suficiente stock de ${product.nombre}. Stock disponible: ${product.stock}`,
          variant: "destructive",
        });
        return;
      }

      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
      toast({
        title: "Carrito actualizado",
        description: `La cantidad de ${product.nombre} ha sido actualizada en tu carrito.`,
      });
    } else {
      // Validar stock al añadir nuevo producto
      if (quantity > product.stock) {
        toast({
          title: "Stock insuficiente",
          description: `No hay suficiente stock de ${product.nombre}. Stock disponible: ${product.stock}`,
          variant: "destructive",
        });
        return;
      }

      setCart([...cart, {
        id: product.id as number,
        name: product.nombre,
        price: product.precio,
        image: product.image,
        descuento: product.descuento,
        stock: product.stock, // ← Añadir stock al item del carrito
        quantity: quantity,
        categoriaDescuento: product.aplicarDescuentoCategoria ? product.categoria?.descuento : 0,
        aplicarDescuentoCategoria: product.aplicarDescuentoCategoria
      }]);
      toast({
        title: "Agregado al carrito",
        description: `${product.nombre} ha sido agregado a tu carrito.`,
      });
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
    toast({
      title: "Eliminado del carrito",
      description: "El artículo ha sido eliminado de tu carrito.",
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.id === productId);
    if (!item) return;

    // Validar que la cantidad no supere el stock disponible
    if (quantity >= item.stock + 1) {
      toast({
        title: "Stock insuficiente",
        description: `No hay suficiente stock de ${item.name}. Stock disponible: ${item.stock}`,
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Carrito vaciado",
      description: "Todos los artículos han sido eliminados de tu carrito.",
    });
  };

    const clearCartCheck = () => {
    setCart([]);
    toast({
      title: "Carrito vacío",
      description: "Tu pedido se está procesando.",
    });
  };

const getCartTotal = () => {
  return cart.reduce((total, item) => {
    const price = item.descuento 
      ? (item.price - (item.price * (item.descuento / 100)))
      : item.categoriaDescuento
        ? (item.price - (item.price * (item.categoriaDescuento / 100)))
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
      clearCartCheck,
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