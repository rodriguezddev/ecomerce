import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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

type PaymentMethodType = "EFECTIVO" | "PAGOMOVIL" | "TRANSFERENCIA" | "ZELLE" | "EFECTIVOBS";

interface PaymentMethod {
  id: number;
  tipo: PaymentMethodType;
  email?: string;
  numeroTelefono?: string;
  cedula?: string;
  nombreDeTitular?: string;
  numeroDeCuenta?: string;
  tipoDeCuenta?: "Ahorro" | "Corriente";
  banco?: string;
}

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

export default function PaymentMethods() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  useEffect(() => {
    if (selectedMethod) {
      form.reset({
        tipo: selectedMethod.tipo,
        ...(selectedMethod.tipo === "ZELLE" && {
          email: selectedMethod.email || "",
        }),
        ...(selectedMethod.tipo === "TRANSFERENCIA" && {
          nombreDeTitular: selectedMethod.nombreDeTitular || "",
          numeroDeCuenta: selectedMethod.numeroDeCuenta || "",
          tipoDeCuenta: selectedMethod.tipoDeCuenta || "Ahorro",
          cedula: selectedMethod.cedula || "",
        }),
        ...(selectedMethod.tipo === "PAGOMOVIL" && {
          numeroTelefono: selectedMethod.numeroTelefono || "",
          cedula: selectedMethod.cedula || "",
          banco: selectedMethod.banco || "",
        }),
      });
    } else {
      form.reset({
        tipo: "PAGOMOVIL",
        nombreDeTitular: "",
        email: "",
        numeroTelefono: "",
        cedula: "",
        numeroDeCuenta: "",
        tipoDeCuenta: "Ahorro",
        banco: "",
      });
    }
  }, [selectedMethod, form]);

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: paymentMethodService.getPaymentMethods,
  });

  // Filter methods based on search term
  const filteredMethods = methods.filter((method: PaymentMethod) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      method.id.toString().includes(searchLower) ||
      method.tipo.toLowerCase().includes(searchLower) ||
      (method.email?.toLowerCase().includes(searchLower) || false) ||
      (method.numeroTelefono?.toLowerCase().includes(searchLower) || false) ||
      (method.banco?.toLowerCase().includes(searchLower) || false)
    );
  });

  // Pagination logic
  const totalItems = filteredMethods.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMethods = filteredMethods.slice(startIndex, endIndex);

  const createMutation = useMutation({
    mutationFn: paymentMethodService.createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Éxito",
        description: "Método de pago creado correctamente",
      });
      setIsDialogOpen(false);
      setCurrentPage(1); // Reset to first page after creation
    },
    onError: (error) => {
      const errorMessages = (error as Error)?.message
        .split(".")
        .filter((msg) => msg.trim().length > 0);
      toast({
        title: "Error",
        description: (
          <div>
            {errorMessages.map((msg, index) => (
              <p key={index}>● {msg.trim()}</p>
            ))}
          </div>
        ),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentMethodFormValues }) =>
      paymentMethodService.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Éxito",
        description: "Método de pago actualizado correctamente",
      });
      setIsDialogOpen(false);
      setSelectedMethod(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar método de pago: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: paymentMethodService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Éxito",
        description: "Método de pago eliminado correctamente",
      });
      // Adjust current page if deleting the last item on the page
      if (paginatedMethods.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar método de pago: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PaymentMethodFormValues) => {
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

    if (selectedMethod) {
      updateMutation.mutate({ id: selectedMethod.id, data: cleanPayload });
    } else {
      createMutation.mutate(cleanPayload);
    }
  };

  const handleOpenDialog = (method?: PaymentMethod) => {
    setSelectedMethod(method || null);
    setIsDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Métodos de Pago</h1>
        <Button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Nuevo Método</span>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            placeholder="Buscar métodos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : methods.length === 0 ? (
            <p className="text-center py-4">
              No hay métodos de pago registrados
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedMethods.map((method: PaymentMethod) => (
                    <TableRow key={method.id}>
                      <TableCell>{method.id}</TableCell>
                      <TableCell>{method.tipo === "PAGOMOVIL" ? "PAGO MOVIL" : method.tipo}</TableCell>
                      <TableCell>
                        {method.email && `Email: ${method.email}`}
                        {method.numeroTelefono && `Teléfono: ${method.numeroTelefono}`}{method.numeroTelefono && ' | '}
                        {method.numeroDeCuenta && `Cuenta: ${method.numeroDeCuenta}`}{method.numeroDeCuenta && ' | '}
                        {method.banco && `Banco: ${method.banco}`}{method.banco && ' | '}
                        {method.cedula && `Cedula: ${method.cedula}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(method)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Estás absolutamente seguro?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará
                                permanentemente el método de pago de nuestros servidores.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(method.id)}
                              >
                                Continuar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} métodos
                    </p>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[5, 10, 20, 30, 50].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMethod
                ? "Editar Método de Pago"
                : "Nuevo Método de Pago"}
            </DialogTitle>
            <DialogDescription>
              {selectedMethod
                ? "Actualice los datos del método de pago"
                : "Ingrese los datos del nuevo método de pago"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Método de Pago</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PAGOMOVIL">PAGO MÓVIL</SelectItem>
                          <SelectItem value="TRANSFERENCIA">
                            TRANSFERENCIA
                          </SelectItem>
                          <SelectItem value="ZELLE">ZELLE</SelectItem>
                          <SelectItem value="EFECTIVO">EFECTIVO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedType === "TRANSFERENCIA" && (
                <FormField
                  control={form.control}
                  name="nombreDeTitular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre del Titular
                        {selectedType === "TRANSFERENCIA" ? "*" : ""}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre completo del titular"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedType === "ZELLE" && (
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input placeholder="Email del titular" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === "TRANSFERENCIA" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numeroDeCuenta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Cuenta*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Número de cuenta (20 dígitos)" 
                            {...field} 
                            maxLength={20}
                            minLength={20}
                            pattern="\d{20}"
                            title="Debe ingresar exactamente 20 dígitos"
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
                        <FormLabel>Tipo de Cuenta*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                        <FormLabel>Número de Teléfono*</FormLabel>
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
                        <FormLabel>Banco*</FormLabel>
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
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="cedula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Cédula{selectedType !== "EFECTIVO" ? "*" : ""}
                        </FormLabel>
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
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {form.formState.isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {selectedMethod ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}