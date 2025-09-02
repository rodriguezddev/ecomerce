import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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

export default function PaymentMethodCreate() {
  const navigate = useNavigate();
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

  const createMutation = useMutation({
    mutationFn: paymentMethodService.createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Éxito",
        description: "Método de pago creado correctamente",
      });
      navigate("/dashboard/metodos-pago");
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

    createMutation.mutate(cleanPayload);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/metodos-pago")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Crear Método de Pago</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Método de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <SelectItem value="TRANSFERENCIA">TRANSFERENCIA</SelectItem>
                        <SelectItem value="ZELLE">ZELLE</SelectItem>
                        <SelectItem value="EFECTIVO">EFECTIVO</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <FormLabel>Nombre del Titular*</FormLabel>
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
                        <FormLabel>Cédula*</FormLabel>
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="cancel"
              onClick={() => navigate("/dashboard/metodos-pago")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" /> Crear Método
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}