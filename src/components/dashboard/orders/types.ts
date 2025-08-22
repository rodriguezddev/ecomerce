export interface PaymentMethod {
  id: number;
  tipo: string;
  email?: string;
  numeroTelefono?: string;
  cedula?: string;
  nombreDeTitular?: string;
  numeroDeCuenta?: string;
  tipoDeCuenta?: "Ahorro" | "Corriente";
  banco?: string;
}

export interface Factura {
  id: number;
  descripcion: string;
  fecha: string;
}

export interface Pedido {
  id: number;
  tipoDePedido: string;
  pagado: boolean;
  estado: string;
  perfil?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  items: Array<{
    id: number;
    cantidad: number;
    producto: {
      id: number;
      nombre: string;
      precio: number;
    };
  }>;
  factura?: Factura;
  pago?: {
    id: number;
    metodoDePago: PaymentMethod;
    numeroReferencia?: string;
  };
}

export interface OrderFormValues {
  tipoDePedido: string;
  pagado: boolean;
  estado: string;
  perfilId?: number | null;
  items: Array<{
    cantidad: number;
    productoId: number;
  }>;
}

// Nuevo tipo para el estado de cancelación
export interface CancelOrderData {
  motivoCancelacion: string;
  devolverStock: boolean;
}

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

export interface Profile {
  id: number;
  email: string;
  perfil?: {
    nombre: string;
    apellido: string;
  };
}