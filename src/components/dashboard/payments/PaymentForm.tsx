import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { paymentService } from "@/services/api-extensions";
import { invoiceService, paymentService as paymentServiceCancel } from "@/services/api-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { apiBcv, paymentService as paymentServiceCreate, orderService } from "@/services/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, FileUp } from "lucide-react";
import { paymentMethodService } from "@/services/paymentMethodService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const paymentFormSchema = z.object({
  nombreFormaDePago: z.string().min(1, "Debe seleccionar una forma de pago"),
  numeroReferencia: z.string().min(3, "El número de referencia debe tener al menos 3 caracteres"),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  tasaBsDelDia: z.number().min(0.01, "La tasa debe ser mayor a 0")
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentMethod {
  id: number;
  tipo: string;
  email?: string;
  numeroTelefono?: string;
  numeroDeCuenta?: string;
  banco?: string;
  cedula?: string;
}

export default function PaymentForm() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payment, setPayment] = useState<any | null>(null);
  const [bdvPrice, setBdvPrice] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [voucher, setVoucher] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await paymentService.getPayments();
      return response || [];
    },
  });

  // Query para obtener métodos de pago del backend
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: paymentMethodService.getPaymentMethods,
  });

  useEffect(() => {
    apiBcv.getBcvPrice()
      .then((response) => {
        if (response) {
          const bcvPrice = response.promedio;
          setBdvPrice(bcvPrice);
          form.setValue("tasaBsDelDia", bcvPrice);
        } else {
          console.error("BCV price not found in response");
        }
      })
      .catch((error) => {
        console.error("Error fetching BCV price:", error);
        toast({
          title: "Error",
          description: "No se pudo obtener el precio del BCV. Por favor, inténtalo de nuevo más tarde.",
          variant: "destructive",
        });
      });
  }, [toast]);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      nombreFormaDePago: "",
      numeroReferencia: "",
      monto: 0,
      tasaBsDelDia: 0
    }
  });

  useEffect(() => {
    if (payments && orderId) {
      const foundPayment = payments.find((p: any) => String(p.numeroReferencia) === orderId);
      setPayment(foundPayment || null);
    }
  }, [payments, orderId]);

  // Update form when data is loaded
  useEffect(() => {
    if (!isLoading && payment) {
      form.reset({
        nombreFormaDePago: payment.nombreFormaDePago,
        numeroReferencia: payment.numeroReferencia,
        monto: payment.monto,
        tasaBsDelDia: bdvPrice || 0
      });
      
      // Si hay un pago existente, encontrar y seleccionar el método de pago correspondiente
      if (payment.metodoDePagoId && paymentMethods.length > 0) {
        const method = paymentMethods.find((m: PaymentMethod) => m.id === payment.metodoDePagoId);
        if (method) {
          setSelectedPaymentMethod(method);
        }
      }
    }
  }, [payment, isLoading, form, bdvPrice, paymentMethods]);

  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVoucher(file);
      
      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setVoucherPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setVoucherPreview(null);
      }
    }
  };

  const mapPaymentMethodToBackend = (tipo: string): string => {
    const mapping: Record<string, string> = {
      "transferencia": "TRANSFERENCIA",
      "pago móvil": "PAGOMOVIL",
      "zelle": "ZELLE",
      "efectivo": "EFECTIVO"
    };
    
    return mapping[tipo.toLowerCase()] || tipo.toUpperCase();
  };

  const createInvoice = async (orderId: number) => {
    try {
      const invoiceData = {
        pedidoId: orderId,
        estado: "Pagada",
        // Otros campos necesarios para la factura
      };
      return await invoiceService.createInvoice(invoiceData);
    } catch (error) {
      console.error("Error al crear factura:", error);
      throw error;
    }
  };

  const processPaymentConfirmation = async () => {
    setIsSubmitting(true);
    try {
      // Actualizar el estado del pedido a pagado
      const orderChanges = {
        pagado: true,
        estado: "Pedido confirmado" // O el estado apropiado para pedidos pagados
      };
      
      await orderService.updateOrder(Number(orderId), orderChanges);
      
      // Crear factura si el pedido no tiene una
      if (payment && !payment.pedido?.factura) {
        try {
          await createInvoice(Number(orderId));
          toast({
            title: "Factura creada",
            description: "Se ha generado una nueva factura para este pedido",
          });
        } catch (error) {
          console.error("Error al crear factura:", error);
          toast({
            title: "Pago confirmado",
            description: "El pago se confirmó pero hubo un error al crear la factura",
            variant: "default",
          });
        }
      }
      
      toast({
        title: "Pago confirmado",
        description: "El pago ha sido marcado como confirmado correctamente",
      });
      
      setShowConfirmationModal(false);
      navigate(-1);
    } catch (error) {
      console.error("Error al confirmar el pago:", error);
      toast({
        title: "Error",
        description: "No se pudo confirmar el pago",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      if (!selectedPaymentMethod) {
        toast({
          title: "Error",
          description: "Debe seleccionar un método de pago",
          variant: "destructive",
        });
        return;
      }

      const paymentFormData = new FormData();
      
      // Agregar campos básicos
      paymentFormData.append("nombreFormaDePago", values.nombreFormaDePago);
      paymentFormData.append("monto", values.monto.toFixed(2).toString());
      paymentFormData.append("metodoDePagoId", selectedPaymentMethod.id.toString());
      
      // Agregar número de referencia si no es efectivo
      if (values.nombreFormaDePago !== "EFECTIVO") {
        paymentFormData.append("numeroReferencia", values.numeroReferencia.trim());
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

      // Actualizar pago existente
      if (payment && payment.id) {
        await paymentServiceCreate.updatePayment(payment.id, paymentFormData);
        toast({
          title: "Éxito",
          description: "Pago actualizado correctamente",
        });
        
        // Mostrar modal de confirmación si el pago se actualizó correctamente
        setShowConfirmationModal(true);
      } else {
        // Crear nuevo pago
        await paymentServiceCreate.createPayment(parseInt(orderId), paymentFormData);
        toast({
          title: "Éxito",
          description: "Pago creado correctamente",
        });
        
        // Mostrar modal de confirmación si el pago se creó correctamente
        setShowConfirmationModal(true);
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pago",
        variant: "destructive",
      });
    }
  };

  const calculateBsAmount = () => {
    const monto = form.watch("monto");
    const tasa = form.watch("tasaBsDelDia");
    return (monto * tasa).toFixed(2);
  };

  if (isLoading || isLoadingPaymentMethods) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        Error al cargar los datos del pago
      </div>
    );
  }

  const pedidoId = payment && (typeof payment?.pedido === 'object' ? payment?.pedido?.id : payment.pedido);




  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Pago del pedido #{orderId}</CardTitle>
          <p>Tasa BCV: {bdvPrice} Bs/USD</p>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {payment && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Pedido</p>
                    <p className="font-medium">#{pedidoId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                    <p className="font-medium">{formatDate(new Date(payment.fecha))}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Factura</p>
                    <p className="font-medium">
                      {payment.pedido?.factura ? (
                        <Badge variant="default">#{payment.pedido.factura.id}</Badge>
                      ) : (
                        <Badge variant="outline">Sin factura</Badge>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total en Bs</p>
                    <p className="font-medium">Bs. {calculateBsAmount()}</p>
                  </div>
                </div>
              )}

              {/* Sección de selección de método de pago */}
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
                      if (method) {
                        form.setValue("nombreFormaDePago", mapPaymentMethodToBackend(method.tipo));
                      }
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
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numeroReferencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Referencia</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!selectedPaymentMethod || selectedPaymentMethod.tipo.toLowerCase() === "efectivo"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value || "0"))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tasaBsDelDia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa del Día (Bs/USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value || "0"))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sección para cargar comprobante de pago */}
              {selectedPaymentMethod && selectedPaymentMethod.tipo.toLowerCase() !== "efectivo" && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileUp className="mr-2" size={20} />
                      Comprobante de Pago
                    </CardTitle>
                    <CardDescription>
                      Suba una imagen del comprobante de pago
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FileUp size={18} />
                          Comprobante de Pago
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
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                Volver
              </Button>
              <Button type="submit" disabled={!selectedPaymentMethod}>
                {payment ? "Actualizar Pago" : "Crear Pago"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Modal de confirmación */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desea marcar el pago como confirmado?</DialogTitle>
            <DialogDescription>
              Al confirmar el pago, el estado del pedido cambiará a "Pedido confirmado" y se creará una factura si no existe una.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmationModal(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={processPaymentConfirmation}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}