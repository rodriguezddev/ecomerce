import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { paymentService } from "@/services/api-extensions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

const paymentFormSchema = z.object({
  nombreFormaDePago: z.string().min(1, "Debe seleccionar una forma de pago"),
  numeroReferencia: z.string().min(3, "El número de referencia debe tener al menos 3 caracteres"),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  tasaBsDelDia: z.number().min(0.01, "La tasa debe ser mayor a 0")
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function PaymentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payment, setPayment] = useState<any | null>(null);

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
    if (payments) {
      const foundPayment = payments.find((p: any) => String(p.numeroReferencia) === id);
      setPayment(foundPayment || null);
    }
  }, [payments, id]);

  // Update form when data is loaded
  useEffect(() => {
    if (!isLoading && payment) {
      form.reset({
        nombreFormaDePago: payment.nombreFormaDePago,
        numeroReferencia: payment.numeroReferencia,
        monto: payment.monto,
        tasaBsDelDia: payment.tasaBsDelDia
      });
    }
  }, [payment, isLoading, form]);

  if (isLoading) {
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

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      if (payment && pedidoId) {
        await paymentService.updatePayment(pedidoId, values);
        toast({
          title: "Pago actualizado",
          description: "El pago ha sido actualizado correctamente",
        });
      }
      navigate("/dashboard/pagos");
    } catch (error) {
      console.error("Error al actualizar pago:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el pago",
        variant: "destructive",
      });
    }
  };

  const calculateBsAmount = () => {
    const monto = form.watch("monto");
    const tasa = form.watch("tasaBsDelDia");
    return (monto * tasa).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Pago #{id}</CardTitle>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombreFormaDePago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pago</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar forma de pago" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TRANSFERENCIA">TRANSFERENCIA</SelectItem>
                        <SelectItem value="PAGOMOVIL">PAGO MÓVIL</SelectItem>
                        <SelectItem value="ZELLE">ZELLE</SelectItem>
                        <SelectItem value="EFECTIVO">EFECTIVO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numeroReferencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Referencia</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate("/dashboard/pagos")}>
              Volver
            </Button>
            <Button type="submit">
              Actualizar Pago
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}