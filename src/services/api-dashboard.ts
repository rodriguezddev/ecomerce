import { formatErrorMessage } from "@/utils/errorMessages";
import { authService } from "./api";
// Types for multipart/form-data

export interface ProductFormData extends FormData {}

// Product service extensions
export const productServiceExtensions = {
  createProduct: async (formData: ProductFormData) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL
        }productos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return responseData
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  updateProduct: async (id: number, formData: ProductFormData) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }productos/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return responseData
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }productos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  applyDiscounts: async (productIds: number[], discount: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }productos/aplicar/descuentos`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productosId: productIds,
            descuento: discount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to apply discounts");
      }

       return responseData
    } catch (error) {
      console.error("Error applying discounts:", error);
      throw error;
    }
  },
};

// Category service extensions
export const categoryServiceExtensions = {
  createCategory: async (categoryData: {
    nombre: string;
    descuento: number;
  }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}categorias`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return response;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (
    id: number,
    categoryData: { nombre?: string; descuento?: number }
  ) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }categorias/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return responseData
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }categorias/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  getCategoryStats: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }categorias/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching category stats:", error);
      throw error;
    }
  },
};

// Order service
export const orderService = {
  createOrder: async (orderData: {
    tipoDePedido: string;
    pagado: boolean;
    estado: string;
    perfilId: number;
    items: Array<{
      cantidad: number;
      productoId: number;
    }>;
  }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}pedidos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}pedidos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }if (!response.ok) {
        throw new Error("Failed to get orders");
      }

       return responseData;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  getOrderById: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pedidos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  updateOrder: async (
    id: number,
    orderData: {
      items?: Array<{
        pedidoItemId: number;
        cantidad: number;
      }>;
      tipoDePedido?: string;
      pagado?: boolean;
      estado?: string;
    }
  ) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pedidos/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  },

  deleteOrder: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pedidos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },

  getUserOrders: async (userId: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pedidos/usuario/pedidos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },

  getUserOrderById: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pedidos/usuario/pedidos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching user order:", error);
      throw error;
    }
  },

  getUserSales: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pedidos/usuario/ventas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching user sales:", error);
      throw error;
    }
  },

  addOrderItems: async (
    orderId: number,
    items: Array<{ cantidad: number; productoId: number }>
  ) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pedidos/${orderId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(items),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error adding order items:", error);
      throw error;
    }
  },

  deleteOrderItem: async (orderId: number, itemId: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pedidos/${orderId}/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return true;
    } catch (error) {
      console.error("Error deleting order item:", error);
      throw error;
    }
  },
};

// Report service
export const reportService = {
  getSalesReport: async (params: {
    fromDay: number;
    fromMonth: number;
    fromYear: number;
    untilDay: number;
    untilMonth: number;
    untilYear: number;
  }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }reportes/reporte-ventas?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get sales report");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error fetching sales report:", error);
      throw error;
    }
  },

  getCategorySalesReport: async (params: {
    fromDay: number;
    fromMonth: number;
    fromYear: number;
    untilDay: number;
    untilMonth: number;
    untilYear: number;
  }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }reportes/reporte-ventas/categorias?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get category sales report");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error fetching category sales report:", error);
      throw error;
    }
  },

  getZeroStockReport: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }reportes/reporte-ventas/productos-con-existencia-cero`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get zero stock report");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error fetching zero stock report:", error);
      throw error;
    }
  },

  getTopSellingReport: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }reportes/reporte-ventas/productos-mas-vendidos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get top selling report");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error fetching top selling report:", error);
      throw error;
    }
  },

  getLeastSellingReport: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }reportes/reporte-ventas/productos-menos-vendidos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get least selling report");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error fetching least selling report:", error);
      throw error;
    }
  },

  getInventoryReport: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }reportes/reporte-ventas/inventario-actual`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get history report");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error fetching history report:", error);
      throw error;
    }
  },
};

// Invoice service
export const invoiceService = {
  createInvoice: async (data: { descripcion: string; pedidoId: number }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}facturas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  },

  getInvoices: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}facturas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  },

  getInvoiceById: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }facturas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  },

  updateInvoice: async (id: number, data: { descripcion: string }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }facturas/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  },

  deleteInvoice: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }facturas/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  },
};

// Shipping company service
export const shippingCompanyService = {
  // Company-related endpoints
  createShippingCompany: async (data: { nombre: string }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }envios/empresa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return responseData
    } catch (error) {
      console.error("Error creating shipping company:", error);
      throw error;
    }
  },

  getShippingCompanies: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }envios/empresa/empresas`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching shipping companies:", error);
      throw error;
    }
  },

  updateShippingCompany: async (id: number, data: { nombre: string }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }envios/empresa/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error updating shipping company:", error);
      throw error;
    }
  },

  deleteShippingCompany: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }envios/empresa/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return true;
    } catch (error) {
      console.error("Error deleting shipping company:", error);
      throw error;
    }
  },

  // Shipment-related endpoints
createShipment: async (formData: FormData) => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Authentication required");
    } console.log('hola')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000"}envios`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
        },
        body: formData,
      }
    );

    const responseData = await response.json();
    console.log("API Response:", responseData);

    if (!response.ok) {
      let errorMessages: string[] = [];

      // Manejar diferentes formatos de error
      if (Array.isArray(responseData.message)) {
        errorMessages = responseData.message;
      } else if (typeof responseData.message === "string") {
        errorMessages = [responseData.message];
      } else if (responseData.error) {
        errorMessages = [responseData.error];
      } else if (responseData.body?.detail) {
        errorMessages = [responseData.body.detail];
      } else {
        errorMessages = ["Error desconocido al crear el envío"];
      }

      throw new Error(formatErrorMessage(errorMessages));
    }

    return responseData;
  } catch (error) {
    console.error("Error creating shipment:", error);
    throw error;
  }
},

  getShipments: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}envios`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching shipments:", error);
      throw error;
    }
  },

  getShipmentById: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }envios/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching shipment:", error);
      throw error;
    }
  },

  updateShipment: async (
    id: number,
    formData: FormData
  ) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }envios/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return responseData
    } catch (error) {
      console.error("Error updating shipment:", error);
      throw error;
    }
  },

  deleteShipment: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }envios/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return true;
    } catch (error) {
      console.error("Error deleting shipment:", error);
      throw error;
    }
  },
};

// Payment service
export const paymentService = {
  createPayment: async (
    pedidoId: number,
    data: { nombreFormaDePago: string; numeroReferencia: string }
  ) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pagos/pedido/${pedidoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  getPayments: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}pagos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  getPaymentById: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}pagos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  },

  updatePayment: async (
    pedidoId: number,
    data: { nombreFormaDePago?: string; numeroReferencia?: string }
  ) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pagos/pedido/${pedidoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  },

  deletePayment: async (pedidoId: number, id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pagos/pedido/${pedidoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  },
};

// User management extensions
export const userServiceExtensions = {
  getProfiles: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }usuarios/perfiles/perfiles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
  },

  getProfileById: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }usuarios/perfiles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  updateProfile: async (
    id: number,
    profileData: {
      cedula?: string;
      numeroTelefono?: string;
      usuarioId?: number;
      nombre?: string;
      apellido?: string;
      direccion?: string;
    }
  ) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }usuarios/perfiles/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  createProfile: async (profileData: {
    cedula: string;
    numeroTelefono: string;
    usuarioId: number;
    nombre: string;
    apellido: string;
    direccion: string;
  }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }usuarios/perfiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

       return responseData
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  },

  deleteProfile: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }usuarios/perfiles/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return true;
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  },

  updateMyProfile: async (profileData: {
    cedula?: string;
    numeroTelefono?: string;
    nombre?: string;
    apellido?: string;
    direccion?: string;
  }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }usuarios/perfiles/perfil/mi-perfil`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessages: string[] = [];

        // Manejar diferentes formatos de error
        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (
          responseData.body.detail &&
          typeof responseData.body.detail === "string"
        ) {
          // Alternative common error field
          errorMessages = responseData.body.detail;
        } else {
          errorMessages = ["Error desconocido al actualizar el envío"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return responseData
    } catch (error) {
      console.error("Error updating my profile:", error);
      throw error;
    }
  },
};
