import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, X, Loader2, Pencil, Eye, Badge, DollarSign, CreditCard, Mail, Phone, User, FileText, Building, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentMethodService } from "@/services/paymentMethodService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const paymentMethodSchema = z
  .object({
    tipo: z.enum(["EFECTIVO", "PAGOMOVIL", "TRANSFERENCIA", "ZELLE", "EFECTIVOBS"]),
    nombreDeTitular: z
      .string()
      .regex(
        /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/,
        "Solo puede contener letras y espacios"
      )
      .optional().or(z.literal("")),
    email: z
      .string()
      .email("Debe ser un correo electrónico válido")
      .optional()
      .or(z.literal("")),
    numeroTelefono: z
      .string()
      .min(10, "El número de teléfono debe tener al menos 10 caracteres")
      .regex(/^\d{4}-\d{7}$/, "El formato debe ser 0414-1234567")
      .optional()
      .or(z.literal("")),
    cedula: z
      .string()
      .min(6, "La cédula debe tener al menos 6 caracteres")
      .regex(/^[0-9]+$/, "La cédula solo puede contener números")
      .optional()
      .or(z.literal("")),
    numeroDeCuenta: z.string()
      .regex(/^\d+$/, "El número de cuenta solo puede contener dígitos numéricos")
      .length(20, "El número de cuenta debe tener exactamente 20 dígitos")
      .optional()
      .or(z.literal("")),
    tipoDeCuenta: z.enum(["Ahorro", "Corriente"]).optional(),
    banco: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "ZELLE") {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El email es requerido para ZELLE",
          path: ["email"],
        });
      }
    }

    if (data.tipo === "TRANSFERENCIA") {
      if (!data.numeroDeCuenta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de cuenta es requerido para TRANSFERENCIA",
          path: ["numeroDeCuenta"],
        });
      }
      if (data.numeroDeCuenta && data.numeroDeCuenta.length !== 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de cuenta debe tener exactamente 20 dígitos",
          path: ["numeroDeCuenta"],
        });
      }
      if (!data.tipoDeCuenta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El tipo de cuenta es requerido para TRANSFERENCIA",
          path: ["tipoDeCuenta"],
        });
      }
      if (!data.nombreDeTitular) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre del titular es requerido para TRANSFERENCIA",
          path: ["nombreDeTitular"],
        });
      }
      if (!data.cedula) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La cédula es requerida para TRANSFERENCIA",
          path: ["cedula"],
        });
      }
    }

    if (data.tipo === "PAGOMOVIL") {
      if (!data.numeroTelefono) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de teléfono es requerido para PAGOMOVIL",
          path: ["numeroTelefono"],
        });
      }
      if (!data.cedula) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La cédula es requerida para PAGOMOVIL",
          path: ["cedula"],
        });
      }
      if (!data.banco) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El banco es requerido para PAGOMOVIL",
          path: ["banco"],
        });
      }
    }
  });

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

const bancosVenezolanos = [
  "Banco de Venezuela",
  "Banesco",
  "Banco Mercantil",
  "Banco Provincial",
  "BBVA Provincial",
  "Banco Bicentenario",
  "Banco Occidental de Descuento",
  "Banco Nacional de Crédito",
  "Banco del Tesoro",
  "Banco Plaza",
  "Banco Caroní",
  "Banco Exterior",
  "Banco Sofitasa",
  "Banco Fondo Común",
  "Banco Venezolano de Crédito",
];

export default function PaymentMethodDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("view");

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      tipo: "PAGOMOVIL",
      nombreDeTitular: "",
      email: "",
      numeroTelefono: "",
      cedula: "",
      numeroDeCuenta: "",
      tipoDeCuenta: "Ahorro",
      banco: "",
    },
  });

  const selectedType = form.watch("tipo");

  // Obtener todos los métodos de pago
  const { data: methods = [], isLoading, error } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: paymentMethodService.getPaymentMethods,
  });

  // Buscar el método específico por ID
  const method = methods.find((m: any) => m.id === Number(id));

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentMethodFormValues }) =>
      paymentMethodService.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Éxito",
        description: "Método de pago actualizado correctamente",
      });
      setActiveTab("view");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar método de pago: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (method) {
      form.reset({
        tipo: method.tipo,
        ...(method.tipo === "ZELLE" && {
          email: method.email || "",
        }),
        ...(method.tipo === "TRANSFERENCIA" && {
          nombreDeTitular: method.nombreDeTitular || "",
          numeroDeCuenta: method.numeroDeCuenta || "",
          tipoDeCuenta: method.tipoDeCuenta || "Ahorro",
          cedula: method.cedula || "",
        }),
        ...(method.tipo === "PAGOMOVIL" && {
          numeroTelefono: method.numeroTelefono || "",
          cedula: method.cedula || "",
          banco: method.banco || "",
        }),
      });
    }
  }, [method, form]);

  const onSubmit = (values: PaymentMethodFormValues) => {
    if (!id) return;

    const basePayload = {
      tipo: values.tipo,
    };

    let payload: any = { ...basePayload };

    if (values.tipo === "ZELLE") {
      payload = {
        ...basePayload,
        email: values.email,
      };
    } else if (values.tipo === "TRANSFERENCIA") {
      payload = {
        ...basePayload,
        nombreDeTitular: values.nombreDeTitular,
        numeroDeCuenta: values.numeroDeCuenta,
        tipoDeCuenta: values.tipoDeCuenta,
        cedula: values.cedula,
      };
    } else if (values.tipo === "PAGOMOVIL") {
      payload = {
        ...basePayload,
        numeroTelefono: values.numeroTelefono,
        cedula: values.cedula,
        banco: values.banco,
      };
    } else if (values.tipo === "EFECTIVO") {
      payload = {
        ...basePayload,
      };
    }

    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== "" && value !== null
      )
    );

    updateMutation.mutate({ id: Number(id), data: cleanPayload });
  };

  const getTipoDisplayName = (tipo: string) => {
    switch (tipo) {
      case "PAGOMOVIL":
        return "PAGO MÓVIL";
      case "TRANSFERENCIA":
        return "TRANSFERENCIA";
      case "ZELLE":
        return "ZELLE";
      case "EFECTIVO":
        return "EFECTIVO";
      case "EFECTIVOBS":
        return "EFECTIVO BS";
      default:
        return tipo;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "PAGOMOVIL":
        return "default";
      case "TRANSFERENCIA":
        return "secondary";
      case "ZELLE":
        return "outline";
      case "EFECTIVO":
        return "destructive";
      case "EFECTIVOBS":
        return "default";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !method) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error al cargar el método de pago</p>
        <Button onClick={() => navigate("/dashboard/metodos-pago")}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/metodos-pago")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Detalles del Método de Pago</h1>
        </div>
        <div className="flex gap-2">
          {activeTab === "edit" ? (
            <>
              <Button
                variant="outline"
                onClick={() => setActiveTab("view")}
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Vista General</TabsTrigger>
              <TabsTrigger value="edit">Editar Información</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold">Información del Método</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <Badge variant={getBadgeVariant(method.tipo)}>
                            {getTipoDisplayName(method.tipo)}
                          </Badge>
                        </div>
                      </div>

                      {method.tipo === "TRANSFERENCIA" && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Titular</p>
                              <p className="font-medium">{method.nombreDeTitular || "No especificado"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Número de Cuenta</p>
                              <p className="font-medium">{method.numeroDeCuenta || "No especificado"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Tipo de Cuenta</p>
                              <p className="font-medium">{method.tipoDeCuenta || "No especificado"}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {method.tipo === "ZELLE" && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{method.email || "No especificado"}</p>
                          </div>
                        </div>
                      )}

                      {method.tipo === "PAGOMOVIL" && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Teléfono</p>
                              <p className="font-medium">{method.numeroTelefono || "No especificado"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Banco</p>
                              <p className="font-medium">{method.banco || "No especificado"}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(method.tipo === "PAGOMOVIL" || method.tipo === "TRANSFERENCIA") && (
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cédula</p>
                            <p className="font-medium">{method.cedula || "No especificado"}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Detalles Adicionales</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm font-medium">ID</span>
                          <span className="text-sm text-muted-foreground">#{method.id}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm font-medium">Tipo</span>
                          <span className="text-sm text-muted-foreground">{getTipoDisplayName(method.tipo)}</span>
                        </div>
                        
                       
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="edit">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Principal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Tipo de Método de Pago
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={true} // Deshabilitado durante la edición
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/50">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PAGOMOVIL">PAGO MÓVIL</SelectItem>
                              <SelectItem value="TRANSFERENCIA">TRANSFERENCIA</SelectItem>
                              <SelectItem value="ZELLE">ZELLE</SelectItem>
                              <SelectItem value="EFECTIVO">EFECTIVO</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            El tipo de método de pago no puede ser modificado una vez creado.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedType === "TRANSFERENCIA" && (
                      <FormField
                        control={form.control}
                        name="nombreDeTitular"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Titular</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre completo del titular" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedType === "ZELLE" && (
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email del titular" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedType === "TRANSFERENCIA" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="numeroDeCuenta"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Cuenta</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Número de cuenta (20 dígitos)" 
                                  {...field} 
                                  maxLength={20}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tipoDeCuenta"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Cuenta</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Ahorro">Ahorro</SelectItem>
                                  <SelectItem value="Corriente">Corriente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {selectedType === "PAGOMOVIL" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="numeroTelefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Teléfono</FormLabel>
                              <FormControl>
                                <Input placeholder="0414-1234567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="banco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Banco</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un banco" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {bancosVenezolanos.map((banco) => (
                                    <SelectItem key={banco} value={banco}>
                                      {banco}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {(selectedType === "PAGOMOVIL" || selectedType === "TRANSFERENCIA") && (
                      <FormField
                        control={form.control}
                        name="cedula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cédula</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Cédula" 
                                {...field} 
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  field.onChange(value);
                                }} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuración Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Información del Tipo</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedType === "PAGOMOVIL" && 
                          "Pago Móvil permite realizar transferencias rápidas mediante número de teléfono."}
                        {selectedType === "TRANSFERENCIA" && 
                          "Transferencia bancaria tradicional requiere datos de cuenta bancaria."}
                        {selectedType === "ZELLE" && 
                          "Zelle es un servicio de transferencias entre personas popular en Estados Unidos."}
                        {selectedType === "EFECTIVO" && 
                          "Pago en efectivo al momento de la entrega."}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium mb-2 text-blue-800">Requerimientos</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {selectedType === "PAGOMOVIL" && (
                          <>
                            <li>• Número de teléfono registrado</li>
                            <li>• Banco asociado</li>
                            <li>• Cédula de identidad</li>
                          </>
                        )}
                        {selectedType === "TRANSFERENCIA" && (
                          <>
                            <li>• Nombre del titular</li>
                            <li>• Número de cuenta (20 dígitos)</li>
                            <li>• Tipo de cuenta</li>
                            <li>• Cédula de identidad</li>
                          </>
                        )}
                        {selectedType === "ZELLE" && (
                          <>
                            <li>• Email registrado en Zelle</li>
                          </>
                        )}
                        {selectedType === "EFECTIVO" && (
                          <>
                            <li>• No requiere información adicional</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-medium mb-2 text-amber-800 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Tipo Bloqueado
                      </h4>
                      <p className="text-sm text-amber-700">
                        El tipo de método de pago no puede ser modificado por razones de integridad de datos. 
                        Si necesita cambiar el tipo, debe crear un nuevo método de pago.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}