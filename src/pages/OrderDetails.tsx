import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Package,
  Truck,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  ImageIcon,
  User
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem {
  id: number;
  cantidad: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    descuento?: number;
    imagen?: string;
  };
}

interface OrderShipping {
  id: number;
  direccionEmpresa: string;
  metodoDeEntrega: string;
  numeroDeGuia?: string;
  fotoGuia?: string;
  empresa?: {
    id: number;
    nombre: string;
  };
}

interface OrderPayment {
  id: number;
  nombreFormaDePago: string;
  monto: number;
  numeroReferencia?: string;
}

interface OrderDetail {
  id: number;
  fecha: string;
  estado: string;
  pagado: boolean;
  tipoDePedido: string;
  precioTotal: number;
  items: OrderItem[];
  envios?: OrderShipping[];
  pagos?: OrderPayment[];
  factura?: any;
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !id) {
      navigate("/pedidos");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getUserOrderById(parseInt(id));

        if (orderData && user?.perfil?.id) {
          setOrder(orderData);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("No se pudo cargar la información del pedido");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, isAuthenticated, navigate, user]);

  const calculateOriginalAmount = () => {
    if (!order) return 0;
    return order.items.reduce((total, item) => {
      const price = item.producto.precio;
      return total + (price * item.cantidad);
    }, 0);
  };

  const calculateDiscountedAmount = () => {
    if (!order) return 0;
    return order.items.reduce((total, item) => {
      const discount = item.producto.descuento || 0;
      const price = item.producto.precio * (1 - discount / 100);
      return total + (price * item.cantidad);
    }, 0);
  };

  const calculateDiscount = () => {
    if (!order) return 0;
    return calculateOriginalAmount() - calculateDiscountedAmount();
  };

  const openImageModal = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsImageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="flex items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Cargando detalles del pedido...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">{error || "No se encontró el pedido"}</p>
          <Button onClick={() => navigate("/pedidos")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a mis pedidos
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pedido en verificacion de pago":
        return "bg-yellow-100 text-yellow-800";
      case "pagado":
      case "pedido pagado":
        return "bg-green-100 text-green-800";
      case "enviado":
        return "bg-blue-100 text-blue-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pedido en verificacion de pago":
        return <Clock className="h-5 w-5" />;
      case "pagado":
      case "pedido pagado":
        return <CheckCircle className="h-5 w-5" />;
      case "enviado":
        return <Truck className="h-5 w-5" />;
      case "cancelado":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/pedidos")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a mis pedidos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Pedido #{order.id}</CardTitle>
                    <CardDescription>
                      Realizado el {formatDate(new Date(order.fecha))}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(order.estado)} px-3 py-1 text-sm flex items-center gap-2`}>
                    {getStatusIcon(order.estado)}
                    {order.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {/* Order items */}
                  <div>
                    <h3 className="font-medium mb-3">Catálogo</h3>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 rounded-md p-2 flex-shrink-0">
                              <Package className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <Link to={`/producto/${item.producto.id}`} className="font-medium hover:text-primary transition-colors">
                                {item.producto.nombre}
                              </Link>
                              <div className="text-sm text-muted-foreground">
                                Cantidad: {item.cantidad}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.producto.descuento ? (
                              <>
                                <div className="text-sm line-through text-gray-500">
                                  ${(item.producto.precio * item.cantidad).toFixed(2)}
                                </div>
                                <div className="font-medium">
                                  ${(
                                    (item.producto.precio * 
                                    (1 - item.producto.descuento / 100)) * 
                                    item.cantidad
                                  ).toFixed(2)}
                                </div>
                              </>
                            ) : (
                              <div className="font-medium">
                                ${(item.producto.precio * item.cantidad).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment info */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Información de Pago
                    </h3>
                    <div className="bg-muted/30 rounded-md p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Método de Pago</p>
                          <p className="font-medium">{order.pagos?.[0]?.nombreFormaDePago || "N/A"}</p>
                        </div>
                        {order.pagos?.[0]?.numeroReferencia && (
                          <div>
                            <p className="text-sm text-muted-foreground">Referencia</p>
                            <p className="font-medium">{order.pagos[0].numeroReferencia}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping info */}
                  {order.envios && order.envios.length > 0 && (
                    <div>
<div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Información de Envío
                      </h3>
                      <div className="bg-muted/30 rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Método de Entrega</p>
                            <p className="font-medium">{order.envios[0].metodoDeEntrega}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Dirección</p>
                            <p className="font-medium">{order.envios[0].direccionEmpresa}</p>
                          </div>
                          {order.envios[0].empresa && (
                            <div>
                              <p className="text-sm text-muted-foreground">Empresa de Envío</p>
                              <p className="font-medium">{order.envios[0].empresa.nombre}</p>
                            </div>
                          )}
                          {order.envios[0].numeroDeGuia && (
                            <div>
                              <p className="text-sm text-muted-foreground">Número de Guía</p>
                              <p className="font-medium">{order.envios[0].numeroDeGuia}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Botón para ver la foto de la guía si existe */}
                        {order.envios[0].fotoGuia && (
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openImageModal(order.envios[0].fotoGuia!)}
                              className="flex items-center gap-2"
                            >
                              <ImageIcon className="h-4 w-4" />
                              Ver foto de la guía
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {
                      order.envios[0].metodoDeEntrega !== "Retiro en tienda" && (
<div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Información del destinatario
                      </h3>
                      <div className="bg-muted/30 rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Nombre</p>
                            <p className="font-medium">{order.envios[0].destinatarioNombre}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Apellido</p>
                            <p className="font-medium">{order.envios[0].destinatarioApellido}</p>
                          </div>
                          {order.envios[0].destinatarioCedula && (
                            <div>
                              <p className="text-sm text-muted-foreground">Cédula</p>
                              <p className="font-medium">{order.envios[0].destinatarioCedula}</p>
                            </div>
                          )}
                          {order.envios[0].destinatarioTelefono && (
                            <div>
                              <p className="text-sm text-muted-foreground">Teléfono</p>
                              <p className="font-medium">{order.envios[0].destinatarioTelefono}</p>
                            </div>
                          )}
                        </div>
                        
                        
                      </div>
                    </div>
                      )
                    }
                    
                    </div>
                    
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal original</span>
                    <span>${calculateOriginalAmount().toFixed(2)}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Descuentos aplicados</span>
                        <span className="text-green-600">
                          -${calculateDiscount().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal con descuento</span>
                        <span>
                          ${calculateDiscountedAmount().toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col border-t pt-4 w-full">
                <div className="mb-2 flex justify-between w-full">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold">${order.precioTotal.toFixed(2)}</span>
                </div>
               <div className="mb-2 flex justify-between w-full text-gray-600">
                  <span className="font-bold">Total Bs</span>
                  <span className="text-xl font-bold ">Bs {(order.precioTotal * order.pagos[0]?.tasaBsDelDia).toFixed(2)}</span>
                </div>
              </CardFooter>
            </Card>

            <div className="mt-6">
              <Button className="w-full" variant="outline" onClick={() => navigate('/')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>

        {/* Modal para mostrar la imagen de la guía */}
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Foto de la Guía de Envío</DialogTitle>
              <DialogDescription>
                Número de guía: {order.envios?.[0]?.numeroDeGuia || "No disponible"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              {currentImage && (
                <img 
                  src={`${import.meta.env.VITE_API_URL}imagenes/${currentImage}` }
                  alt="Foto de la guía de envío" 
                  className="max-w-full h-auto rounded-md"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetails;