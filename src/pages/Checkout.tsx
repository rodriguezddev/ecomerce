import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Textarea
} from "@/components/ui/textarea";
import {
  CreditCard,
  Truck,
  Home,
  Package,
  FileUp,
  Loader2,
  TruckIcon,
  User
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { apiBcv, orderService, paymentService, profileService, shippingService } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { productServiceExtensions, shippingCompanyService } from "@/services/api-dashboard";
import { paymentMethodService } from "@/services/paymentMethodService";
import { Checkbox } from "@/components/ui/checkbox";
import { productService } from "@/services/api";

interface PaymentMethod {
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

interface RecipientData {
  nombre: string;
  apellido: string;
  cedula: string;
  numeroTelefono: string;
}

// Función para validar stock
const validateStock = async (cartItems: any[]) => {
  try {
    for (const item of cartItems) {
      const product = await productService.getProductById(item.id);
      if (product.stock < item.quantity) {
        return {
          valid: false,
          message: `No hay suficiente stock para ${product.nombre} (Disponible: ${product.stock}, Solicitado: ${item.quantity})`
        };
      }
    }
    return { valid: true, message: "" };
  } catch (error) {
    console.error("Error al validar stock:", error);
    return {
      valid: false,
      message: "Error al verificar el stock de los productos"
    };
  }
};

// Función para actualizar el stock de productos
const updateProductStock = async (cartItems: any[]) => {
  try {
    for (const item of cartItems) {
      const product = await productService.getProductById(item.id);
      const newStock = product.stock - item.quantity;
      
      // Usar FormData para la actualización
      const formData = new FormData();
      formData.append("stock", newStock.toString());
      
      await productServiceExtensions.updateProduct(item.id, formData);
    }
    return true;
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    return false;
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCartCheck, getCartTotalSinDescuento } = useCart();
  const { toast } = useToast();
  const { isAuthenticated, user, profile } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [shippingCompany, setShippingCompany] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [voucher, setVoucher] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [branchOffice, setBranchOffice] = useState("");
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
  
  // Datos de quien retira el paquete
  const [usarDatosCliente, setUsarDatosCliente] = useState(true);
  const [datosQuienRetira, setDatosQuienRetira] = useState<RecipientData>({
    nombre: "",
    apellido: "",
    cedula: "",
    numeroTelefono: "",
  });

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['shippingCompanies'],
    queryFn: shippingCompanyService.getShippingCompanies,
  });

  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: paymentMethodService.getPaymentMethods,
  });

      const { data: userEnvio, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["user", user?.perfil?.id],
    queryFn: async () => {
      try {
        if (!user?.perfil?.id) {
          throw new Error("ID de perfil no disponible");
        }
        return await profileService.getProfileById(user.perfil.id);
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
    },
    enabled: !!user?.perfil?.id, // Importante: evita ejecución con ID 0
  });

  // Check if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega algunos artículos a tu carrito antes de proceder al pago",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [cart, navigate, toast]);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && userEnvio) {
      setFirstName(userEnvio.nombre || "");
      setLastName(userEnvio.apellido || "");
      setAddress(userEnvio.direccion || "");
      
      // Pre-fill datos de quien retira con los datos del perfil
      setDatosQuienRetira({
        nombre: userEnvio.nombre || "",
        apellido: userEnvio.apellido || "",
        cedula: userEnvio.cedula || "",
        numeroTelefono: userEnvio.numeroTelefono || "",
      });
    } else if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, userEnvio]);

  // Actualizar datos de quien retira cuando cambia la opción "usarDatosCliente"
  useEffect(() => {
    if (usarDatosCliente && userEnvio) {
      setDatosQuienRetira({
        nombre: userEnvio.nombre || "",
        apellido: userEnvio.apellido || "",
        cedula: userEnvio.cedula || "",
        numeroTelefono: userEnvio.numeroTelefono || "",
      });
    } else {
      setDatosQuienRetira({
        nombre: userEnvio?.nombre || "",
        apellido: userEnvio?.apellido || "",
        cedula: userEnvio?.cedula || "",
        numeroTelefono: userEnvio?.numeroTelefono || "",
      });
    }
  }, [usarDatosCliente, userEnvio]);

  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVoucher(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const mapPaymentMethodToBackend = (method: string) => {
    const mapping: Record<string, string> = {
      "transferencia": "TRANSFERENCIA",
      "pago móvil": "PAGOMOVIL",
      "zelle": "ZELLE",
      "efectivo": "EFECTIVO"
    };
    return mapping[method.toLowerCase()] || method.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isAuthenticated || !user?.perfil.id) {
      setIsAuthModalOpen(true);
      setIsSubmitting(false);
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Método de pago no seleccionado",
        description: "Por favor seleccione un método de pago",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate reference number for methods that require it
    const requiresReference = ["TRANSFER", "PAGOMOVIL", "ZELLE"].includes(
      mapPaymentMethodToBackend(selectedPaymentMethod.tipo)
    );
    
    if (requiresReference && (!referenceNumber || referenceNumber.trim() === '')) {
      toast({
        title: "Número de referencia requerido",
        description: "Por favor ingrese el número de referencia de su pago",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate shipping information
    if (deliveryMethod === "local_shipping" && !address) {
      toast({
        title: "Dirección requerida",
        description: "Por favor ingrese su dirección para envío local",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (deliveryMethod === "national_shipping" && (!shippingCompany || !branchOffice)) {
      toast({
        title: "Información de envío incompleta",
        description: "Por favor seleccione empresa de envío y sucursal",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validar datos de quien retira para retiro en tienda
    if (deliveryMethod === "national_shipping" && !usarDatosCliente) {
      if (!datosQuienRetira.nombre || !datosQuienRetira.apellido || 
          !datosQuienRetira.cedula || !datosQuienRetira.numeroTelefono) {
        toast({
          title: "Datos incompletos",
          description: "Por favor complete todos los datos de quien retirará el paquete",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Validar stock antes de crear el pedido
    const stockValidation = await validateStock(cart);
    if (!stockValidation.valid) {
      toast({
        title: "Stock insuficiente",
        description: stockValidation.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate order total
      const subtotal = getCartTotalSinDescuento();
      const orderTotal = subtotal;

      // Create order
      const orderItems = cart.map(item => ({
        cantidad: item.quantity,
        productoId: item.id
      }));

      const orderData = {
        tipoDePedido: "Online",
        estado: "Pedido en verificacion de pago",
        pagado: false,
        perfilId: user.perfil.id,
        items: orderItems,
      };

      const orderResponse = await orderService.createOrder(orderData);
      const orderId = orderResponse.id;

      // Actualizar el stock de los productos
      const stockUpdated = await updateProductStock(cart);
      if (!stockUpdated) {
        toast({
          title: "Advertencia",
          description: "El pedido se creó pero hubo un error al actualizar el stock de los productos",
          variant: "default",
        });
      }

      // Process payment - usando FormData para incluir la imagen
      const paymentFormData = new FormData();
      
      // Agregar campos básicos
      paymentFormData.append("nombreFormaDePago", mapPaymentMethodToBackend(selectedPaymentMethod.tipo));
      paymentFormData.append("monto", orderTotal.toString());
      paymentFormData.append("metodoDePagoId", selectedPaymentMethod.id.toString());
      
      // Agregar número de referencia si no es efectivo
      if (selectedPaymentMethod.tipo.toLowerCase() !== "efectivo") {
        paymentFormData.append("numeroReferencia", referenceNumber.trim());
      }
      
      // Agregar imagen del comprobante si existe
      if (voucher) {
        paymentFormData.append("image", voucher);
      } else if (voucherPreview) {
        // Si tenemos voucherPreview (base64) pero no el archivo, convertirlo
        try {
          const response = await fetch(voucherPreview);
          const blob = await response.blob();
          const file = new File([blob], "comprobante.png", { type: blob.type });
          paymentFormData.append("image", file);
        } catch (error) {
          console.error("Error al convertir voucherPreview a archivo:", error);
        }
      }

      await paymentService.createPayment(orderId, paymentFormData);

      // Create shipping
      let shippingAddressText = "";
      if (deliveryMethod === "pickup") {
        shippingAddressText = "Retiro en tienda";
      } else if (deliveryMethod === "local_shipping") {
        shippingAddressText = `${address}, ${firstName} ${lastName}`;
      } else {
        const company = companies.find(c => c.id.toString() === shippingCompany);
        shippingAddressText = `${branchOffice} - ${company?.nombre || 'Empresa de envíos'}`;
      }

      const shippingData: any = {
        pedidoId: orderId,
        direccionEmpresa: shippingAddressText,
        metodoDeEntrega: deliveryMethod === "pickup" ? "Retiro en tienda" : 
                         deliveryMethod === "local_shipping" ? "Delivery" : "Envio nacional",
        ...(deliveryMethod === "national_shipping" && { 
          empresaId: parseInt(shippingCompany, 10) 
        })
      };

      // Agregar datos de quien retira si es retiro en tienda
      if (deliveryMethod === "national_shipping") {
        if (usarDatosCliente) {
          shippingData.destinatarioNombre = datosQuienRetira.nombre || "";
          shippingData.destinatarioApellido = datosQuienRetira?.apellido || "";
          shippingData.destinatarioCedula = datosQuienRetira?.cedula || "";
          shippingData.destinatarioTelefono = datosQuienRetira?.numeroTelefono || "";
        } else {
          shippingData.destinatarioNombre = datosQuienRetira.nombre;
          shippingData.destinatarioApellido = datosQuienRetira.apellido;
          shippingData.destinatarioCedula = datosQuienRetira.cedula;
          shippingData.destinatarioTelefono = datosQuienRetira.numeroTelefono;
        }
      }

      await shippingService.createShipping(shippingData);

      // Success
      toast({
        title: "¡Pedido realizado!",
        description: "Su pedido ha sido registrado exitosamente",
      });

      clearCartCheck();
      navigate(`/pedidos/${orderId}`);

    } catch (error) {
      console.error("Error processing order:", error);
      toast({
        title: "Error al procesar pedido",
        description: "Ocurrió un error al procesar su pedido. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthModalClose = (open: boolean) => {
    setIsAuthModalOpen(open);
    if (!open && !isAuthenticated) {
      navigate("/carrito");
    }
  };

  const handleDatosQuienRetiraChange = (field: keyof RecipientData, value: string) => {
    setDatosQuienRetira(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          {/* Form Section - Visible on all screens */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <form onSubmit={handleSubmit} id="checkout-form">
              {/* Delivery Method Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2" size={20} />
                    Método de Entrega
                  </CardTitle>
                  <CardDescription>
                    Seleccione cómo desea recibir su pedido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={setDeliveryMethod}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 bg-white border rounded-lg p-4">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex items-center cursor-pointer">
                        <Home className="mr-2" size={18} />
                        <div>
                          <p className="font-medium">Retiro en Tienda</p>
                          <p className="text-sm text-gray-500">Recoja su pedido en nuestra tienda</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white border rounded-lg p-4">
                      <RadioGroupItem value="local_shipping" id="local_shipping" />
                      <Label htmlFor="local_shipping" className="flex items-center cursor-pointer">
                        <Package className="mr-2" size={18} />
                        <div>
                          <p className="font-medium">Envío Local</p>
                          <p className="text-sm text-gray-500">Entrega en su dirección dentro de la ciudad</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white border rounded-lg p-4">
                      <RadioGroupItem value="national_shipping" id="national_shipping" />
                      <Label htmlFor="national_shipping" className="flex items-center cursor-pointer">
                        <TruckIcon className="mr-2" size={18} />
                        <div>
                          <p className="font-medium">Envío Nacional</p>
                          <p className="text-sm text-gray-500">Entrega a sucursal de empresa de envíos</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Sección para datos de quien retira (solo para Retiro en tienda) */}
              {deliveryMethod === "national_shipping" && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2" size={20} />
                      Datos de quien retirará el paquete
                    </CardTitle>
                    <CardDescription>
                      Información de la persona autorizada para retirar el pedido
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="usarDatosCliente"
                        checked={usarDatosCliente}
                        onCheckedChange={(checked) => setUsarDatosCliente(checked === true)}
                      />
                      <Label htmlFor="usarDatosCliente" className="cursor-pointer">
                        Usar mis datos personales
                      </Label>
                    </div>

                    {!usarDatosCliente ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="retiraNombre">Nombre *</Label>
                          <Input
                            id="retiraNombre"
                            value={datosQuienRetira.nombre}
                            onChange={(e) => handleDatosQuienRetiraChange("nombre", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retiraApellido">Apellido *</Label>
                          <Input
                            id="retiraApellido"
                            value={datosQuienRetira.apellido}
                            onChange={(e) => handleDatosQuienRetiraChange("apellido", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retiraCedula">Cédula *</Label>
                          <Input
                            id="retiraCedula"
                            value={datosQuienRetira.cedula}
                            onChange={(e) => handleDatosQuienRetiraChange("cedula", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retiraTelefono">Teléfono *</Label>
                          <Input
                            id="retiraTelefono"
                            value={datosQuienRetira.numeroTelefono}
                            onChange={(e) => handleDatosQuienRetiraChange("numeroTelefono", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-2">Tus datos:</h4>
                        <p><strong>Nombre:</strong> {userEnvio?.nombre} {userEnvio?.apellido}</p>
                        <p><strong>Cédula:</strong> {userEnvio?.cedula || 'No especificada'}</p>
                        <p><strong>Teléfono:</strong> {userEnvio?.numeroTelefono || 'No especificado'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Shipping Details */}
              {deliveryMethod === "local_shipping" && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Dirección de Envío</CardTitle>
                    <CardDescription>
                      Ingrese su dirección exacta para el envío
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección Completa</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {deliveryMethod === "national_shipping" && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Envío Nacional</CardTitle>
                    <CardDescription>
                      Seleccione empresa de envíos y sucursal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Empresa de Envío</Label>
                      <Select
                        value={shippingCompany}
                        onValueChange={setShippingCompany}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchOffice">Dirección exacta de la sucursal</Label>
                      <Input
                        id="branchOffice"
                        value={branchOffice}
                        onChange={(e) => setBranchOffice(e.target.value)}
                        required
                        placeholder="Nombre de la sucursal"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Método de Pago
                  </CardTitle>
                  <CardDescription>
                    Seleccione cómo desea pagar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedPaymentMethod?.id?.toString() || ""}
                    onValueChange={(value) => {
                      const method = paymentMethods.find((m: PaymentMethod) => m.id.toString() === value);
                      setSelectedPaymentMethod(method || null);
                    }}
                    className="space-y-4"
                  >
                    {paymentMethods.map((method: PaymentMethod) => (
                      <div key={method.id} className="flex items-center space-x-2 bg-white border rounded-lg p-4">
                        <RadioGroupItem 
                          value={method.id.toString()} 
                          id={`method-${method.id}`}
                        />
                        <Label htmlFor={`method-${method.id}`} className="cursor-pointer flex-1">
                          <div className="font-medium">{method.tipo}</div>
                          <div className="text-sm text-gray-600">
                            {method.email && `Email: ${method.email}`}
                            {method.numeroTelefono && `Teléfono: ${method.numeroTelefono}`}{method.numeroTelefono && ' | '}
                            {method.numeroDeCuenta && `Cuenta: ${method.numeroDeCuenta}`}{method.numeroDeCuenta && ' | '}
                            {method.banco && `Banco: ${method.banco}`}{method.banco && ' | '}
                            {method.cedula && `Cedula: ${method.cedula}`}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Payment Details */}
                  {selectedPaymentMethod && (
                    <div className="mt-6 space-y-4 border-t pt-4">
                      {["TRANSFERENCIA", "PAGOMOVIL", "ZELLE"].includes(
                        mapPaymentMethodToBackend(selectedPaymentMethod.tipo)
                      ) && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="referenceNumber">Número de Referencia</Label>
                            <Input
                              id="referenceNumber"
                              value={referenceNumber}
                              onChange={(e) => setReferenceNumber(e.target.value)}
                              required
                              placeholder="Ingrese número de referencia"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <FileUp size={18} />
                              Comprobante de Pago (Opcional)
                            </Label>
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleVoucherChange}
                            />
                            {voucherPreview && (
                              <div className="mt-2">
                                <img
                                  src={voucherPreview}
                                  alt="Comprobante"
                                  className="max-h-40 border rounded"
                                />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {selectedPaymentMethod.tipo.toLowerCase() === "efectivo" && (
                        <div className="text-sm text-gray-600">
                          <p>Pague directamente en nuestra tienda al retirar su pedido.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-2 lg:order-2">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
                <CardDescription>
                  {cart.length} {cart.length === 1 ? "artículo" : "artículos"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2">
                          {item.quantity}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.descuento 
    ? `$${(item.price - (item.price * (item.descuento / 100))).toFixed(2)}`
    : `$${item.price.toFixed(2)}`
  }</span>
                    </div>
                  ))}
                </div>

              </CardContent>
              <CardFooter className="border-t flex-col space-y-4">
                <div className="w-full flex justify-between items-center pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>

                <div className="w-full flex justify-between items-center border-t">
                  <span className="text-lg font-bold text-gray-600">Total Bs</span>
                  <span className="text-lg font-bold text-gray-600">Bs {(getCartTotal() * bdvPrice).toFixed(2)}</span>
                  
                </div>
                
                {/* Submit Button - Visible only on mobile, positioned after order summary */}
                <div className=" w-full">
                  <Button
                    type="submit"
                    form="checkout-form"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || !selectedPaymentMethod}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : "Confirmar Pedido"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={handleAuthModalClose}
        initialMode="login"
      />
    </div>
  );
};

export default Checkout;