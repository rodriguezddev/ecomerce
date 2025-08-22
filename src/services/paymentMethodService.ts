import { authService } from "./api";

const formatErrorMessage = (messages: string | string[]): string => {
  if (Array.isArray(messages)) {
    return messages.join(". ");
  }
  return messages;
};

export const paymentMethodService = {
  // Crear método de pago
  createPaymentMethod: async (data: {
    nombre: string;
    email: string;
    numeroTelefono: string;
    cedula: string;
    nombreDeTitular: string;
  }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pagos/metodo-de-pago`,
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

        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (responseData.body?.detail) {
          errorMessages = [responseData.body.detail];
        } else {
          errorMessages = ["Error desconocido al crear el método de pago"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return responseData;
    } catch (error) {
      console.error("Error creating payment method:", error);
      throw error;
    }
  },

  // Obtener todos los métodos de pago
  getPaymentMethods: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pagos/metodo-de-pago/metodos-de-pago`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get payment methods");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      throw error;
    }
  },

  // Actualizar método de pago
  updatePaymentMethod: async (
    id: number,
    data: {
      nombre: string;
      email: string;
      numeroTelefono: string;
      cedula: string;
      nombreDeTitular: string;
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
        }pagos/metodo-de-pago/${id}`,
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
      console.log("API Response:", responseData);

      if (!response.ok) {
        let errorMessages: string[] = [];

        if (Array.isArray(responseData.message)) {
          errorMessages = responseData.message;
        } else if (typeof responseData.message === "string") {
          errorMessages = [responseData.message];
        } else if (responseData.error) {
          errorMessages = [responseData.error];
        } else if (responseData.body?.detail) {
          errorMessages = [responseData.body.detail];
        } else {
          errorMessages = ["Error desconocido al actualizar el método de pago"];
        }

        throw new Error(formatErrorMessage(errorMessages));
      }

      return responseData;
    } catch (error) {
      console.error("Error updating payment method:", error);
      throw error;
    }
  },

  // Eliminar método de pago
  deletePaymentMethod: async (id: number) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }pagos/metodo-de-pago/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete payment method");
      }

      return true;
    } catch (error) {
      console.error("Error deleting payment method:", error);
      throw error;
    }
  },
};
