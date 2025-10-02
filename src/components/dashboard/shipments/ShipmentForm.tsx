import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  shippingCompanyService,
  orderService,
} from "@/services/api-extensions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const recipientSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  cedula: z.string().min(1, "La cédula es requerida"),
  numeroTelefono: z.string().min(1, "El teléfono es requerido"),
});

const shipmentFormSchema = z
  .object({
    empresaId: z
      .number()
      .positive("Debe seleccionar una empresa de envío")
      .optional(),
    pedidoId: z.number().positive("Debe seleccionar un pedido"),
    direccionEmpresa: z.string().optional(),
    metodoDeEntrega: z.string().min(1, "Debe seleccionar un método de entrega"),
    numeroDeGuia: z.string().optional(),
    image: z.string().optional(),
    usarDatosCliente: z.boolean().default(true),
    destinatario: recipientSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.metodoDeEntrega === "Envio nacional") {
        return !!data.empresaId;
      }
      return true;
    },
    {
      message: "Debe seleccionar una empresa de envío para 'Envío nacional'",
      path: ["empresaId"],
    }
  )
  .refine(
    (data) => {
      if (!data.usarDatosCliente && data.metodoDeEntrega === "Envio nacional") {
        return !!data.destinatario;
      }
      return true;
    },
    {
      message: "Debe completar los datos del destinatario",
      path: ["destinatario"],
    }
  )
  .refine(
    (data) => {
      if (data.metodoDeEntrega === "Delivery" || data.metodoDeEntrega === "Envio nacional") {
        return data.direccionEmpresa && data.direccionEmpresa.trim().length > 0;
      }
      return true;
    },
    {
      message: "La dirección es requerida para este método de entrega",
      path: ["direccionEmpresa"],
    }
  )

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-800";
    case "pagado":
      return "bg-blue-100 text-blue-800";
    case "enviado":
      return "bg-green-100 text-green-800";
    case "cancelado":
      return "bg-red-100 text-red-800";
    case "completado":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ShipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      empresaId: undefined,
      pedidoId: undefined,
      direccionEmpresa: "",
      metodoDeEntrega: "Retiro en tienda",
      numeroDeGuia: "",
      image: "",
      usarDatosCliente: true,
      destinatario: {
        nombre: "",
        apellido: "",
        cedula: "",
        numeroTelefono: "",
      },
    },
  });

  const metodoDeEntrega = form.watch("metodoDeEntrega");
  const usarDatosCliente = form.watch("usarDatosCliente");
  const pedidoId = form.watch("pedidoId");

  // Fetch shipment if editing
  const { data: shipment, isLoading: shipmentLoading } = useQuery({
    queryKey: ["shipment", id],
    queryFn: async () => {
      if (id) {
        return await shippingCompanyService.getShipmentById(Number(id));
      }
      return null;
    },
    enabled: isEditing,
  });

  // Fetch shipping companies
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["shipping-companies"],
    queryFn: async () => {
      const response = await shippingCompanyService.getShippingCompanies();
      return response || [];
    },
  });

  // Fetch all shipments to check for existing shipments
  const {
    data: shipments = [],
    isLoading: shipmentsLoading,
  } = useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const response = await shippingCompanyService.getShipments();
      return response || [];
    },
  });

  // Fetch orders with more details and filter by status
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders-for-shipment", id],
    queryFn: async () => {
      const response = await orderService.getOrders();
      
      // Obtener IDs de pedidos que ya tienen envío
      const pedidosConEnvio = shipments.map(shipment => 
        typeof shipment.pedido === "object" ? shipment.pedido.id : Number(shipment.pedido)
      );
      
      return (
        response
          .filter(order => {
            // Si estamos editando, permitir el pedido actual incluso si ya tiene envío
            if (isEditing && shipment && order.id === (typeof shipment.pedido === "object" ? shipment.pedido.id : shipment.pedido)) {
              return true;
            }
            
            // Filtrar pedidos en proceso de empaquetado que no tengan envío
            return order.estado === "Pedido en proceso de empaquetado" && 
                   !pedidosConEnvio.includes(order.id);
          })
          .map((order) => ({
            ...order,
            totalItems: order.items.reduce((sum, item) => sum + item.cantidad, 0),
            clienteNombre: `${order.perfil?.nombre || ''} ${order.perfil?.apellido || ''}`.trim(),
            clienteTelefono: order.perfil?.numeroTelefono || '',
            clienteCedula: order.perfil?.cedula || '',
            tieneEnvio: pedidosConEnvio.includes(order.id),
          })) || []
      );
    },
  });

  // Obtener datos del pedido seleccionado
  const selectedOrder = useMemo(() => {
    return orders.find(order => order.id === pedidoId);
  }, [pedidoId, orders]);

  // Filtrar pedidos basados en el término de búsqueda
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.id.toString().includes(term) ||
      order.clienteNombre.toLowerCase().includes(term) ||
      formatDate(new Date(order.fecha)).toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  // Update form when data is loaded
  useEffect(() => {
    if (!shipmentLoading && shipment) {
      const destinatarioData = shipment.destinatario || {
        nombre: shipment.destinatarioNombre || "",
        apellido: shipment.destinatarioApellido || "",
        cedula: shipment.destinatarioCedula || "",
        numeroTelefono: shipment.destinatarioTelefono || "",
      };
      
      const usarDatosClienteValue = !destinatarioData.nombre && 
                                  !destinatarioData.apellido && 
                                  !destinatarioData.cedula;
      
      form.reset({
        empresaId:
          typeof shipment.empresa === "object"
            ? shipment?.empresa?.id
            : Number(shipment.empresa),
        pedidoId:
          typeof shipment.pedido === "object"
            ? shipment?.pedido?.id
            : Number(shipment.pedido),
        direccionEmpresa: shipment.direccionEmpresa,
        metodoDeEntrega: shipment.metodoDeEntrega,
        numeroDeGuia: shipment.numeroDeGuia || "",
        image: shipment.image || "",
        usarDatosCliente: usarDatosClienteValue,
        destinatario: destinatarioData,
      });
    }
  }, [shipment, shipmentLoading, form]);

  // Actualizar datos del destinatario cuando cambia la opción "usarDatosCliente" o el pedido seleccionado
  useEffect(() => {
    if (usarDatosCliente && selectedOrder) {
      form.setValue("destinatario", {
        nombre: selectedOrder.perfil?.nombre || "",
        apellido: selectedOrder.perfil?.apellido || "",
        cedula: selectedOrder.perfil?.cedula || "",
        numeroTelefono: selectedOrder.perfil?.numeroTelefono || "",
      });
    }
  }, [usarDatosCliente, selectedOrder, form]);

  useEffect(() => {
    if (
      metodoDeEntrega === "Delivery" ||
      metodoDeEntrega === "Retiro en tienda"
    ) {
      form.setValue("empresaId", undefined, { shouldValidate: true });
      form.setValue("numeroDeGuia", "", { shouldValidate: true });
      form.setValue("image", "", { shouldValidate: true });
    }
  }, [metodoDeEntrega, form]);

  const onSubmit = async (values: ShipmentFormValues) => {
    const {
      formState: { dirtyFields },
    } = form;
    try {
      // Verificar si el pedido ya tiene envío (solo para creación)
      if (!isEditing) {
        const pedidosConEnvio = shipments.map(shipment => 
          typeof shipment.pedido === "object" ? shipment.pedido.id : Number(shipment.pedido)
        );
        
        if (pedidosConEnvio.includes(values.pedidoId)) {
          toast({
            title: "Error",
            description: "Este pedido ya tiene un envío asociado. No se puede crear otro envío para el mismo pedido.",
            variant: "destructive",
          });
          return;
        }
      }

      const formData = new FormData();

      if (isEditing) {
        if (dirtyFields.empresaId && values.empresaId) {
          formData.append("empresaId", values.empresaId.toString());
        }
        if (dirtyFields.pedidoId && values.pedidoId) {
          formData.append("pedidoId", values.pedidoId.toString());
        }
        if (dirtyFields.direccionEmpresa) {
          formData.append("direccionEmpresa", values.direccionEmpresa);
        }
        if (dirtyFields.metodoDeEntrega) {
          formData.append("metodoDeEntrega", values.metodoDeEntrega);
        }
        if (dirtyFields.numeroDeGuia) {
          formData.append("numeroDeGuia", values.numeroDeGuia);
        }
        if (dirtyFields.image) {
          if (values.image instanceof File) {
            formData.append("image", values.image);
          } else if (
            typeof values.image === "string" &&
            values.image.startsWith("data:")
          ) {
            const blob = await fetch(values.image).then((res) => res.blob());
            const file = new File([blob], "guia.png", { type: blob.type });
            formData.append("image", file);
          }
        }
        
        // Agregar datos del destinatario
        if (dirtyFields.usarDatosCliente || dirtyFields.destinatario) {
          if (values.destinatario) {
            formData.append("destinatarioNombre", values.destinatario.nombre);
            formData.append("destinatarioApellido", values.destinatario.apellido);
            formData.append("destinatarioCedula", values.destinatario.cedula);
            formData.append("destinatarioTelefono", values.destinatario.numeroTelefono);
          } else {
            // Limpiar datos de destinatario personalizados
            formData.append("destinatarioNombre", "");
            formData.append("destinatarioApellido", "");
            formData.append("destinatarioCedula", "");
            formData.append("destinatarioTelefono", "");
          }
        }

        if (formData.entries().next().done) {
          toast({
            title: "Sin cambios",
            description: "No se ha modificado ningún campo.",
          });
          return;
        }

        await shippingCompanyService.updateShipment(Number(id), formData);

        // Validar número de guía antes de cambiar estado para envío nacional
        if (values.metodoDeEntrega === "Envio nacional") {
          if (!values.numeroDeGuia || values.numeroDeGuia.trim().length === 0) {
            toast({
              title: "Advertencia",
              description: "El envío se actualizó pero el estado no cambió porque falta el número de guía",
              variant: "default",
            });
          } else {
            await orderService.updateOrder(values.pedidoId, {estado: "Pedido enviado"});
            toast({
              title: "Envío actualizado",
              description: "El envío ha sido actualizado correctamente y el pedido marcado como enviado",
            });
          }
        } else if (values.metodoDeEntrega === "Retiro en tienda") {
          await orderService.updateOrder(values.pedidoId, {
              estado: "Disponible para entregar",
            });
        }  else {
          
          toast({
            title: "Envío actualizado",
            description: "El envío ha sido actualizado correctamente",
          });
        }
      } else {
        if (values.empresaId) {
          formData.append("empresaId", values.empresaId.toString());
        }
        
        formData.append("pedidoId", values.pedidoId.toString());
        formData.append("direccionEmpresa", values.direccionEmpresa);
        formData.append("metodoDeEntrega", values.metodoDeEntrega);
        
        if (values.numeroDeGuia) {
          formData.append("numeroDeGuia", values.numeroDeGuia);
        }

        if (values.image) {
          if (values.image instanceof File) {
            formData.append("image", values.image);
          } else if (
            typeof values.image === "string" &&
            values.image.startsWith("data:")
          ) {
            const blob = await fetch(values.image).then((res) => res.blob());
            const file = new File([blob], "guia.png", { type: blob.type });
            formData.append("image", file);
          }
        }
        
        // Agregar datos del destinatario para creación
        if (values.destinatario) {
          formData.append("destinatarioNombre", values.destinatario.nombre);
          formData.append("destinatarioApellido", values.destinatario.apellido);
          formData.append("destinatarioCedula", values.destinatario.cedula);
          formData.append("destinatarioTelefono", values.destinatario.numeroTelefono);
        }

        const createdShipment = await shippingCompanyService.createShipment(
          formData
        );

              // 1. Actualizar el estado del pedido a "cancelado"
              const updatedOrder = await orderService.updateOrder(values.pedidoId, {
                estado: "Disponible para entregar",
              });
              
              console.log("Pedido actualizado:", updatedOrder);

        // Validar número de guía antes de cambiar estado para envío nacional
        if (values.metodoDeEntrega === "Envio nacional") {
          if (!values.numeroDeGuia || values.numeroDeGuia.trim().length === 0) {
            toast({
              title: "Envío creado",
              description: "El envío ha sido creado. Debe agregar el número de guía para marcar el pedido como enviado.",
            });
          } else {
            await orderService.updateOrder(values.pedidoId, {
              estado: "Pedido enviado",
            });
            toast({
              title: "Envío creado",
              description: "El envío ha sido creado con todos los datos y el pedido marcado como enviado",
            });
          }
        } else if (values.metodoDeEntrega === "Retiro en tienda") {
          await orderService.updateOrder(values.pedidoId, {
              estado: "Disponible para entregar",
            });
        } else {
          toast({
            title: "Envío creado",
            description: "El envío ha sido creado correctamente",
          });
        }
      }

      navigate("/dashboard/envios");
    } catch (error) {
      console.error("Error al guardar envío:", (error as Error)?.message);
      const oraciones = (error as Error)?.message
        .split(".")
        .filter((oracion) => oracion.trim().length > 0);

      toast({
        title: "Error",
        description: oraciones.map((oracion) => {
          return (
            <p key={oracion}>
              ● {oracion.trim()}
              <br />
            </p>
          );
        }),
        variant: "destructive",
      });
    }
  };

  if ((isEditing && shipmentLoading) || companiesLoading || ordersLoading || shipmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">Cargando...</div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{isEditing ? "Editar Envío" : "Nuevo Envío"}</CardTitle>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pedidoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedido</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString() || ''}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar pedido" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[400px] w-[var(--radix-select-trigger-width)]">
                      <div className="sticky top-0 z-10 bg-background px-3 py-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar pedido..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <SelectItem
                            key={order.id}
                            value={order.id.toString()}
                            className="py-1"
                            disabled={order.tieneEnvio && !isEditing}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">#{order.id}</span>
                              <span className="truncate flex-1">
                                {order.clienteNombre || 'Sin cliente'} - {formatDate(new Date(order.fecha))}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                ${order.precioTotal.toFixed(2)}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(order.estado)}`}
                              >
                                {order.estado}
                              </Badge>
                              {order.tieneEnvio && (
                                <Badge variant="destructive" className="text-xs">
                                  Ya tiene envío
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )  : (
                        <div className="py-2 text-center text-sm text-muted-foreground">
                          {orders.length === 0 
                            ? "No hay pedidos disponibles" 
                            : isEditing && shipment 
                              ? `El pedido #${shipment.pedidoId} no está disponible (puede que ya haya sido enviado)`
                              : "No hay pedidos en proceso de empaquetado que coincidan con la búsqueda"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metodoDeEntrega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Entrega</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Retiro en tienda">
                        Retiro en tienda
                      </SelectItem>
                      <SelectItem value="Delivery">Delivery</SelectItem>
                      <SelectItem value="Envio nacional">
                        Envío nacional
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {
              (metodoDeEntrega === "Delivery" ) && (
                 <FormField
                control={form.control}
                name="direccionEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Dirección a domicilio *
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder={"Ingrese la dirección completa para la entrega a domicilio"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              )
            }

            {metodoDeEntrega === "Envio nacional" && (
              <>
                {/* Sección de datos del destinatario */}
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="text-lg font-medium">Datos del destinatario</h3>
                  
                  <FormField
                    control={form.control}
                    name="usarDatosCliente"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Usar datos del cliente del pedido
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {!usarDatosCliente && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="destinatario.nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="destinatario.apellido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="destinatario.cedula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cédula *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="destinatario.numeroTelefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                    </div>
                  )}
                  
                  {usarDatosCliente && selectedOrder && (
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-2">Datos del cliente:</h4>
                      <p><strong>Nombre:</strong> {selectedOrder.perfil?.nombre} {selectedOrder.perfil?.apellido}</p>
                      <p><strong>Cédula:</strong> {selectedOrder.perfil?.cedula || 'No especificada'}</p>
                      <p><strong>Teléfono:</strong> {selectedOrder.perfil?.numeroTelefono || 'No especificado'}</p>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="empresaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa de Envío</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem
                              key={company.id}
                              value={company.id.toString()}
                            >
                              {company.nombre}
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
                name="direccionEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {metodoDeEntrega === "Envio nacional" 
                        ? "Dirección exacta de la sucursal *" 
                        : "Dirección a domicilio *"}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder={
                          metodoDeEntrega === "Envio nacional" 
                            ? "Ingrese la dirección exacta de la sucursal de envío" 
                            : "Ingrese la dirección completa para la entrega a domicilio"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                  control={form.control}
                  name="numeroDeGuia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Guía *</FormLabel>
                      <FormControl> 
                        <Input
                          {...field}
                          placeholder="Ingrese el número de guía (requerido para envío nacional)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foto de la Guía (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                field.onChange(event.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            } else {
                              field.onChange("");
                            }
                          }}
                        />
                      </FormControl>
                      {field.value && (
                        <div className="mt-2">
                          <img
                            src={field.value}
                            alt="Foto de guía actual"
                            className="h-20 w-auto rounded-md"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-1"
                            onClick={() => field.onChange("")}
                          >
                            Eliminar imagen
                          </Button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="cancel"
              type="button"
              onClick={() => navigate("/dashboard/envios")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Actualizar Envío" : "Crear Envío"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}