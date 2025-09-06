
import { useToast, toast } from '@/hooks/use-toast';
import { formatErrorMessage } from '@/utils/errorMessages';

// Types based on the API responses
export interface Profile {
  id?: number;
  nombre: string;
  apellido: string;
  direccion: string;
  cedula: string;
  numeroTelefono: string;
  usuarioId?: number;
  usuario?: any;
  pedidos?: any[];
}

export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  rol?: string;
  perfil: Profile;
  ventas?: any[];
  token: string;
  refreshToken?: string;
}

export interface Category {
  id?: number;
  nombre: string;
  descuento: number;
  productos?: any[];
}

export interface Product {
  id?: number;
  image: string;
  nombre: string;
  descripcion: string;
  disponible: boolean;
  descuento: number;
  precio: number;
  aplicarDescuentoCategoria: boolean;
  stock: number;
  codigo: string;
  categoria: Category;
  pedidoItems?: any[];
  name?: string;
  rating?: number;
  reviews?: number;
}

export interface OrderItem {
  cantidad: number;
  productoId: number;
  pedidoItemId?: number;
  id?: number;
  producto?: Product;
  pedido?: any;
}

export interface Order {
  id?: number;
  tipoDePedido: string;
  estado: string;
  pagado: boolean;
  fecha?: string;
  perfilId: number;
  items: OrderItem[];
  perfil?: Profile;
  vendedor?: User;
  pago?: Payment;
  envios?: any[];
}

export interface Payment extends FormData {
  id?: number;
  nombreFormaDePago: string;
  numeroReferencia: string;
  pedido?: any;
  factura?: any;
}

export interface Shipping {
  id?: number;
  empresaId: number;
  pedidoId: number;
  direccionEmpresa: string;
  metodoDeEntrega: string;
  empresa?: ShippingCompany;
  pedido?: Order;
}

export interface ShippingCompany {
  id: number;
  nombre: string;
  envios?: any[];
}

export interface bdvPrice {
  precio: number;
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  // Primero clonamos la respuesta para poder leerla múltiples veces si es necesario
  const responseClone = response.clone();
  
  try {
    const data = await response.json();
    
    if (!response.ok) {
      // Si la respuesta no es exitosa, lanzamos un error con los datos del mensaje
      const errorMessage = data.message || 
                         (Array.isArray(data.message) ? data.message.join('. ') : 
                         data.error || 
                         `HTTP error! status: ${response.status}`);
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (jsonError) {
    // Si falla el .json(), intentamos leer como texto
    try {
      const textData = await responseClone.text();
      
      if (!response.ok) {
        throw new Error(textData || `HTTP error! status: ${response.status}`);
      }
      
      return textData;
    } catch (textError) {
      console.error('Error reading response:', textError);
      throw new Error('Failed to parse server response');
    }
  }
};


// Authentication services
export const authService = {
  async login(username: string, password: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}auth/iniciar-sesion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log(response, "XXXXXXXXXXX")
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(user: any) {
    const apiUrl = `${import.meta.env.VITE_API_URL}usuarios`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);


      if (!response.ok) {
    let errorMessages: string[] = [];

    // Manejar diferentes formatos de error
    if (Array.isArray(responseData.message)) {
        errorMessages = responseData.message;
    } else if (typeof responseData.message === 'string') {
        errorMessages = [responseData.message];
    } else if (responseData.error) {
        errorMessages = [responseData.error];
    }  else if (responseData.body.detail && typeof responseData.body.detail === 'string') {
          // Alternative common error field
      errorMessages = responseData.body.detail;
    } else  {
        errorMessages = ['Error desconocido al actualizar el envío'];
    }
console.log(Error(formatErrorMessage(errorMessages)))
    throw new Error(formatErrorMessage(errorMessages));
}

      return responseData;

    } catch (error) {
      console.error('Error en el registro (AuthService):', error);
      // Re-throw the error, it's already formatted
      throw error;
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Correo electrónico no encontrado en la base de datos');
      }

      const data = await response.json();
      toast({
        title: 'Recuperación de contraseña',
        description: 'Se ha enviado un enlace de recuperación a tu correo electrónico.',
      });
      return data;
    } catch (error) {
      console.error('Password recovery error:', error);
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}auth/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

            if (!response.ok) {
    let errorMessages: string[] = [];

    // Manejar diferentes formatos de error
    if (Array.isArray(responseData.message)) {
        errorMessages = responseData.message;
    } else if (typeof responseData.message === 'string') {
        errorMessages = [responseData.message];
    } else if (responseData.error) {
        errorMessages = [responseData.error];
    }  else if (responseData.body.detail && typeof responseData.body.detail === 'string') {
          // Alternative common error field
      errorMessages = responseData.body.detail;
    } else  {
        errorMessages = ['Error desconocido al actualizar el envío'];
    }
console.log(Error(formatErrorMessage(errorMessages)))
    throw new Error(formatErrorMessage(errorMessages));
}

      return responseData;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user JSON:', error);
      // If there's an error parsing JSON, clear the invalid data
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

// User services
export const userService = {
  async getUsers() {
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios`, { headers });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  async getUserById(id: number) {
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/${id}`, { headers });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
  
  async updateUser(id: number, userData: Partial<User>) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  async deleteUser(id: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// Profile services
export const profileService = {
  async createProfile(profile: Profile) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/perfiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async getProfiles() {
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/perfiles/perfiles`, { headers });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  },
  
  async getProfileById(id: number) {
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/perfiles/${id}`, { headers });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  async updateProfile(id: number, profileData: Partial<Profile>) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/perfiles/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  async updateMyProfile(profileData: Partial<Profile>) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/perfiles/perfil/mi-perfil`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  async deleteProfile(id: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}usuarios/perfiles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
};

// Category services
export const categoryService = {
  async getCategories() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}categorias`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getCategoryById(id: number) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}categorias/${id}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }
};

// Product services
export const productService = {
  async getProducts() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}productos`);
      return await handleResponse(response) as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id: number) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}productos/${id}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  async deleteProduct(id: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Order services
export const orderService = {
  async createOrder(order: Order) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(order),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getOrders() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrderById(id: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async updateOrder(id: number, orderData: Partial<Order>) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  async getUserOrders() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos/usuario/pedidos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  async getUserOrderById(id: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos/usuario/pedidos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching user order:', error);
      throw error;
    }
  },

  async getUserSales() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos/usuario/ventas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching user sales:', error);
      throw error;
    }
  },

  async addOrderItems(orderId: number, items: OrderItem[]) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos/${orderId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(items),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error adding order items:', error);
      throw error;
    }
  },

  async deleteOrderItem(orderId: number, itemId: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pedidos/${orderId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting order item:', error);
      throw error;
    }
  }
};

// Payment services
export const paymentService = {
  async createPayment(orderId: number, payment: Payment) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Validación adicional del orderId
      if (typeof orderId !== 'number' || isNaN(orderId)) {
        throw new Error('El ID del pedido debe ser un número válido');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pagos/pedido/${orderId}`, {
        method: 'POST',
        headers: {
          //'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body:payment,
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },
  async getOrderPayments(orderId: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pagos/pedido/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  async getPaymentById(paymentId: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pagos/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  async updatePayment(orderId: number, payment: Payment) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pagos/pedido/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payment),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  async deletePayment(orderId: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}pagos/pedido/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
};

// Shipping services
export const shippingService = {
  async createShipping(shipping: Shipping) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}envios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shipping),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating shipping:', error);
      throw error;
    }
  },

  async getShippings() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}envios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching shippings:', error);
      throw error;
    }
  },

  async getShippingById(shippingId: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}envios/${shippingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching shipping:', error);
      throw error;
    }
  },

  async updateShipping(shippingId: number, shipping: Partial<Shipping>) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}envios/${shippingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shipping),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating shipping:', error);
      throw error;
    }
  },

  async deleteShipping(shippingId: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}envios/${shippingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting shipping:', error);
      throw error;
    }
  },

  async getShippingCompanies() {
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}envios/empresa`, { headers });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching shipping companies:', error);
      throw error;
    }
  }
};
//https://pydolarve.org/api/v1/dollar?page=bcv 
export const apiBcv = {
  getBcvPrice: async () => {
    try {


      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial',);
      console.log(response, "XXXXXXXXXXX")
      if (!response.ok) {
        throw new Error('Failed to fetch BCV price');
      } 
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  },
}