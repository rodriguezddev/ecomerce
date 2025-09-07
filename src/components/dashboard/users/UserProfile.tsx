import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Shield, FileText, Phone, MapPin, Edit, Save, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { profileService } from "@/services/api";
import { Loader2 } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  email: z.string().email("Email inválido"),
  rol: z.string().min(1, "El rol es requerido"),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "La nueva contraseña debe tener al menos 6 caracteres",
  }),
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

type UserFormValues = z.infer<typeof userSchema>;

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  const { data: user, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["user", id],
    queryFn: () => {
      if (!id) throw new Error("User ID is required");
      return userService.getUserById(Number(id));
    },
    enabled: !!id,
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
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

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        password: "",
        rol: user.rol,
        perfil: {
          nombre: user.perfil?.nombre || "",
          apellido: user.perfil?.apellido || "",
          direccion: user.perfil?.direccion || "",
          cedula: user.perfil?.cedula || "",
          numeroTelefono: user.perfil?.numeroTelefono || "",
        },
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (isError) {
      console.error("Error al cargar el perfil del usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del usuario.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return "bg-red-500 hover:bg-red-600";
      case 'Vendedor':
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-green-500 hover:bg-green-600";
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    try {
      const userData: Partial<UserFormValues> = {};
      const profileData: Partial<UserFormValues['perfil']> = {};
      
      // Solo enviar campos modificados
      if (form.formState.dirtyFields.username) userData.username = data.username;
      if (form.formState.dirtyFields.email) userData.email = data.email;
      if (form.formState.dirtyFields.rol) userData.rol = data.rol;
      if (data.password) userData.password = data.password;

      if (form.formState.dirtyFields.perfil) {
        if (form.formState.dirtyFields.perfil.nombre) profileData.nombre = data.perfil.nombre;
        if (form.formState.dirtyFields.perfil.apellido) profileData.apellido = data.perfil.apellido;
        if (form.formState.dirtyFields.perfil.direccion) profileData.direccion = data.perfil.direccion;
        if (form.formState.dirtyFields.perfil.cedula) profileData.cedula = data.perfil.cedula;
        if (form.formState.dirtyFields.perfil.numeroTelefono) profileData.numeroTelefono = data.perfil.numeroTelefono;
      }

      const updatePromises = [];

      if (id && Object.keys(userData).length > 0) {
        updatePromises.push(userService.updateUser(Number(id), userData));
      }

      if (id && Object.keys(profileData).length > 0) {
        updatePromises.push(profileService.updateProfile(id, profileData));
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        toast({
          title: "Usuario actualizado",
          description: "Los cambios se han guardado correctamente.",
        });
        refetch();
        setIsEditing(false);
      } else {
        toast({ title: "Sin cambios", description: "No se ha modificado ningún campo." });
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del usuario.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Cargando perfil del usuario...</div>;
  }

  if (isError || !user) {
    return <div>Error al cargar el perfil del usuario.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
        
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Vista General</TabsTrigger>
              <TabsTrigger value="edit" onClick={() => setIsEditing(true)}>
                Editar Información
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="view">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos de la Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre de Usuario</p>
                        <p className="font-medium">{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Rol</p>
                        <Badge className={getRoleBadgeColor(user.rol)}>{user.rol}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.perfil ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Nombre Completo</p>
                            <p className="font-medium">{user.perfil.nombre} {user.perfil.apellido}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cédula</p>
                            <p className="font-medium">{user.perfil.cedula}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{user.perfil.numeroTelefono}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 md:col-span-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Dirección</p>
                            <p className="font-medium">{user.perfil.direccion}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Este usuario no tiene un perfil asociado.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="edit">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos de la Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de Usuario</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* <FormField
                      control={form.control}
                      name="password"
                     
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Dejar en blanco para no cambiar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                    <FormField
                      control={form.control}
                      name="rol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="perfil.nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                          <FormLabel>Teléfono</FormLabel>
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
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>

                  
                </Card>
                   
              </div>
               <div className="flex gap-2 justify-between w-full pt-3">
              <Button 
                variant="cancel"
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}