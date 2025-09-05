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
  TruckIcon
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { orderService, paymentService, shippingService } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { shippingCompanyService } from "@/services/api-dashboard";
import { paymentMethodService } from "@/services/paymentMethodService";

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

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart, getCartTotalSinDescuento } = useCart();
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

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['shippingCompanies'],
    queryFn: shippingCompanyService.getShippingCompanies,
  });

  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: paymentMethodService.getPaymentMethods,
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
    if (isAuthenticated && profile) {
      setFirstName(profile.nombre || "");
      setLastName(profile.apellido || "");
      setAddress(profile.direccion || "");
    } else if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, profile]);

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

    try {
      // Calculate order total
      const subtotal = getCartTotalSinDescuento();
      const shippingCost = deliveryMethod === "pickup" ? 0 : 
                         deliveryMethod === "local_shipping" ? 5.99 : 10.99;
      const orderTotal = subtotal + shippingCost;

      // Create order
      const orderItems = cart.map(item => ({
        cantidad: item.quantity,
        productoId: item.id
      }));

      const orderData = {
        tipoDePedido: "Tienda",
        estado: "Pedido en verificacion de pago",
        pagado: false,
        perfilId: user.perfil.id,
        items: orderItems,
      };

      const orderResponse = await orderService.createOrder(orderData);
      const orderId = orderResponse.id;

      // Process payment
      const paymentBase = {
        nombreFormaDePago: mapPaymentMethodToBackend(selectedPaymentMethod.tipo),
        monto: orderTotal,
        metodoDePagoId: selectedPaymentMethod.id
      };

      // Solo agregar numeroReferencia si NO es efectivo
      const paymentData = selectedPaymentMethod.tipo.toLowerCase() === "efectivo"
        ? paymentBase
        : {
            ...paymentBase,
            numeroReferencia: referenceNumber.trim()
          };

      await paymentService.createPayment(orderId, paymentData);

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

      const shippingData = {
        pedidoId: orderId,
        direccionEmpresa: shippingAddressText,
        metodoDeEntrega: deliveryMethod === "pickup" ? "Retiro en tienda" : 
                         deliveryMethod === "local_shipping" ? "Envio local" : "Envio nacional",
        ...(deliveryMethod === "national_shipping" && { 
          empresaId: parseInt(shippingCompany, 10) 
        })
      };

      await shippingService.createShipping(shippingData);

      // Success
      toast({
        title: "¡Pedido realizado!",
        description: "Su pedido ha sido registrado exitosamente",
      });

      clearCart();
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
                      <Label htmlFor="branchOffice">Sucursal</Label>
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

              {/* Submit Button - Hidden on mobile, shown on desktop */}
              {/* <div className="hidden lg:block">
                <Button
                  type="submit"
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
              </div> */}
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

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t flex-col space-y-4">
                <div className="w-full flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">
                    ${(
                      getCartTotal() + 
                      (deliveryMethod === "pickup" ? 0 : 
                       deliveryMethod === "local_shipping" ? 5.99 : 10.99)
                    ).toFixed(2)}
                  </span>
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