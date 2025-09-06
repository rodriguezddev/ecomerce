import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const createUserSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.string().min(1, "El rol es requerido"),
  perfil: z.object({
    nombre: z.string()
      .min(1, "El nombre es requerido")
      .regex(/^[a-zA-Z\s]+$/, { message: "El nombre solo puede contener letras y espacios" }),
    apellido: z.string()
      .min(1, "El apellido es requerido")
      .regex(/^[a-zA-Z\s]+$/, { message: "El apellido solo puede contener letras y espacios" }),
    direccion: z.string().min(1, "La dirección es requerida"),
    cedula: z.string()
      .min(1, "La cédula es requerida")
      .regex(/^[0-9]+$/, { message: "La cédula solo puede contener números" }),
    numeroTelefono: z.string()
      .min(1, "El número de teléfono es requerido")
      .regex(/^\d{4}-\d{7}$/, { message: "El formato del teléfono debe ser 0414-1234567" })
  }),
});

type UserFormValues = z.infer<typeof createUserSchema>;

interface UserFormProps {
  onSuccess?: () => void;
}

export default function UserForm({ onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");

  const form = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      rol: "Usuario",
      perfil: {
        nombre: "",
        apellido: "",
        direccion: "",
        cedula: "",
        numeroTelefono: "",
      },
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      await authService.register(data);
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado correctamente",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard/usuarios");
      }
    } catch (error) {
      console.error("Error al crear usuario:", (error as Error)?.message);
      const oraciones = (error as Error)?.message.split('.').filter(oracion => oracion.trim().length > 0);
      
      toast({
        title: "Error",
        description: oraciones.map(oracion => {
          return <p key={oracion}>● {oracion.trim()}<br/></p>;
        }),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-3">
      <CardHeader>
        <CardTitle>Nuevo Usuario</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs 
            defaultValue="user" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">Datos de Usuario</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de Usuario</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de usuario" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input placeholder="Contraseña" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Administrador">Administrador</SelectItem>
                              <SelectItem value="Vendedor">Vendedor</SelectItem>
                              <SelectItem value="Cliente">Cliente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="perfil.nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="perfil.apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Apellido" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="perfil.cedula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cédula</FormLabel>
                          <FormControl>
                            <Input placeholder="Cédula" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="perfil.numeroTelefono"
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
                      name="perfil.direccion"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input placeholder="Dirección" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="cancel"
              onClick={() => navigate("/dashboard/usuarios")}
            >
              Cancelar
            </Button>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeTab === "user") {
                    setActiveTab("profile");
                  } else {
                    setActiveTab("user");
                  }
                }}
              >
                {activeTab === "user" ? "Siguiente: Perfil" : "Anterior: Datos de Usuario"}
              </Button>
              
              {activeTab === 'profile' && (
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Usuario
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}