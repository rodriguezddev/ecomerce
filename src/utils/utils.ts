import { OrderFormValues } from "./types";
import { productService } from "@/services/api";
import { productServiceExtensions } from "@/services/api-dashboard";
import { toast } from "@/hooks/use-toast";

export const arraysEqual = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => 
    item.productoId === b[index].productoId && 
    item.cantidad === b[index].cantidad
  );
};

export const getChangedFields = (currentValues: OrderFormValues, initialValues: OrderFormValues | null, isEditing: boolean) => {
  if (!initialValues || !isEditing) return currentValues;

  const changes: Partial<OrderFormValues> = {};

  if (currentValues.tipoDePedido !== initialValues.tipoDePedido) {
    changes.tipoDePedido = currentValues.tipoDePedido;
  }
  if (currentValues.pagado !== initialValues.pagado) {
    changes.pagado = currentValues.pagado;
  }
  if (currentValues.estado !== initialValues.estado) {
    changes.estado = currentValues.estado;
  }
  if (currentValues.perfilId !== initialValues.perfilId) {
    changes.perfilId = currentValues.perfilId;
  }

  const itemsChanged = !arraysEqual(currentValues.items, initialValues.items);
  if (itemsChanged) {
    changes.items = currentValues.items;
  }

  return changes;
};

export const calculateTotal = (selectedProducts: any[]) => {
  return selectedProducts.reduce((total, product) => {
    const precioConDescuento = product.precio - (product.precio * (product.descuento / 100));
    return total + (precioConDescuento * product.cantidad);
  }, 0);
};

export const mapPaymentMethodToBackend = (method: string) => {
  const mapping: Record<string, string> = {
    "transferencia": "TRANSFERENCIA",
    "pago móvil": "PAGOMOVIL",
    "zelle": "ZELLE",
    "efectivo": "EFECTIVO"
  };
  return mapping[method.toLowerCase()] || method.toUpperCase();
};

export const validateStock = async (items: any[], initialItems: any[] = [], isEditing: boolean) => {
  try {
    if (!isEditing) {
      // Validación para nuevo pedido
      for (const item of items) {
        const product = await productService.getProductById(item.productoId);
        if (product.stock < item.cantidad) {
          return {
            valid: false,
            message: `No hay suficiente stock para el producto ${product.nombre} (Stock disponible: ${product.stock})`
          };
        }
      }
    } else if (initialItems.length > 0) {
      // Validación para edición de pedido
      const originalItemsMap = new Map<number, number>();
      initialItems.forEach(item => {
        originalItemsMap.set(item.productoId, item.cantidad);
      });

      for (const newItem of items) {
        const originalQuantity = originalItemsMap.get(newItem.productoId) || 0;
        const quantityDifference = newItem.cantidad - originalQuantity;

        if (quantityDifference > 0) {
          const product = await productService.getProductById(newItem.productoId);
          if (product.stock < quantityDifference) {
            return {
              valid: false,
              message: `No hay suficiente stock para el producto ${product.nombre} (Stock disponible: ${product.stock}, se necesitan ${quantityDifference} más)`
            };
          }
        }
      }
    }
    
    return { valid: true, message: "" };
  } catch (error) {
    console.error("Error al verificar el stock:", error);
    return {
      valid: false,
      message: "No se pudo verificar el stock de los productos"
    };
  }
};

export const updateProductStock = async (items: any[], initialItems: any[] = [], isEditing: boolean) => {
  try {
    if (!isEditing) {
      // Actualizar stock para nuevo pedido
      for (const item of items) {
        const product = await productService.getProductById(item.productoId);
        const newStock = product.stock - item.cantidad;
        
        const formData = new FormData();
        formData.append("stock", newStock.toString());
        await productServiceExtensions.updateProduct(Number(item.productoId), formData);
      }
    } else if (initialItems.length > 0) {
      // Actualizar stock para edición de pedido
      const originalItemsMap = new Map<number, number>();
      initialItems.forEach(item => {
        originalItemsMap.set(item.productoId, item.cantidad);
      });

      // Procesar cada item nuevo
      for (const newItem of items) {
        const originalQuantity = originalItemsMap.get(newItem.productoId) || 0;
        const quantityDifference = newItem.cantidad - originalQuantity;

        if (quantityDifference !== 0) {
          const product = await productService.getProductById(newItem.productoId);
          const newStock = product.stock - quantityDifference;
          
          const formData = new FormData();
          formData.append("stock", newStock.toString());
          await productServiceExtensions.updateProduct(Number(newItem.productoId), formData);
        }
      }

      // Manejar items eliminados (devolver stock)
      const newItemsMap = new Map<number, number>();
      items.forEach(item => {
        newItemsMap.set(item.productoId, item.cantidad);
      });
      
      for (const originalItem of initialItems) {
        if (!newItemsMap.has(originalItem.productoId)) {
          // Este item fue eliminado, devolver stock
          const product = await productService.getProductById(originalItem.productoId);
          const newStock = product.stock + originalItem.cantidad;
          
          const formData = new FormData();
          formData.append("stock", newStock.toString());
          await productServiceExtensions.updateProduct(Number(originalItem.productoId), formData);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error al actualizar el stock de los productos:", error);
    return false;
  }
};

export const restoreProductStock = async (items: any[]) => {
  try {
    for (const item of items) {
      const product = await productService.getProductById(item.productoId);
      const newStock = product.stock + item.cantidad;
      
      const formData = new FormData();
      formData.append("stock", newStock.toString());
      await productServiceExtensions.updateProduct(Number(item.productoId), formData);
    }
    return true;
  } catch (error) {
    console.error("Error al devolver el stock:", error);
    return false;
  }
};