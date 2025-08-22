
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { invoiceService } from "@/services/api-extensions";
import { orderService } from "@/services/api-extensions";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const invoiceFormSchema = z.object({
  descripcion: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  pedidoId: z.number().positive("Debe seleccionar un pedido")
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      descripcion: "",
      pedidoId: 0
    }
  });

  // Fetch invoice if editing
  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      if (id) {
        return await invoiceService.getInvoiceById(Number(id));
      }
      return null;
    },
    enabled: isEditing,
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await orderService.getOrders();
      return response || [];
    }
  });

  // Update form when data is loaded
  useEffect(() => {
    if (!invoiceLoading && invoice) {
      form.reset({
        descripcion: invoice.descripcion,
        pedidoId: typeof invoice.pedido === 'object' ? invoice?.pedido?.id : Number(invoice.pedido)
      });
    }
  }, [invoice, invoiceLoading, form]);

  // Handle form submission
  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      if (isEditing) {
        await invoiceService.updateInvoice(Number(id), values);
        toast({
          title: "Recibo de entrega actualizado",
          description: "El recibo de entrega ha sido actualizada correctamente",
        });
      } else {
        await invoiceService.createInvoice(values);
        toast({
          title: "Recibo de entrega creado",
          description: "El recibo de entrega ha sido creada correctamente",
        });
      }
      navigate("/dashboard/recibo");
    } catch (error) {
      console.error("Error al guardar el recibo de entrega:", error);
      toast({
        title: "Error",
        description: (error as any)?.response?.message[0] || "No se pudo guardar el recibo de entrega",
        variant: "destructive",
      });
    }
  };

  if ((isEditing && invoiceLoading) || ordersLoading) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar recibo de entrega" : "Nueva recibo de entrega"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pedidoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedido</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar pedido" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orders.map((order: any) => (
                        <SelectItem key={order.id} value={order.id.toString()}>
                          Pedido #{order.id} - {order.perfil?.nombre} {order.perfil?.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ingrese una descripción para el recibo de entrega"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="cancel" type="button" onClick={() => navigate("/dashboard/recibo")}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Actualizar recibo de entrega" : "Crear recibo de entrega"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
