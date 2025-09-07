import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService, productService, profileService, userService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthModal } from "@/components/AuthModal";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  User, 
  KeySquare, 
  Save, 
  ArrowLeft, 
  Mail, 
  Shield, 
  FileText, 
  Phone, 
  MapPin, 
  Edit,
  X,
  Eye,
  EyeOff,
  CreditCard,
  Home,
  Send
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Esquema de validación para el perfil
const profileSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido")
    .regex(/^[a-zA-Z\s]+$/, { message: "El nombre solo puede contener letras y espacios" }),
  apellido: z.string()
    .min(1, "El apellido es requerido")
    .regex(/^[a-zA-Z\s]+$/, { message: "El apellido solo puede contener letras y espacios" }),
  numeroTelefono: z.string()
    .min(1, "El número de teléfono es requerido")
    .regex(/^\d{4}-\d{7}$/, { message: "El formato del teléfono debe ser 0414-1234567" }),
  direccion: z.string().min(1, "La dirección es requerida"),
});

// Esquema de validación para la contraseña
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Debe confirmar la nueva contraseña")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const recoverySchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido" }),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

const Profile = () => {
  const { isAuthenticated, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  const recoveryForm = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (isEditing) {
      setActiveTab("edit");
    } else {
      setActiveTab("view");
    }
  }, [isEditing]);

    const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["user", user?.perfil?.id],
  queryFn: async () => {
    try {
      if (!user?.perfil?.id) {
        throw new Error("ID de perfil no disponible");
      }
      return await profileService.getProfileById(user.perfil.id);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },
  enabled: !!user?.perfil?.id, // Importante: evita ejecución con ID 0
});
    console.log(data)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      cedula: data?.cedula || "",
      numeroTelefono: data?.numeroTelefono || data?.telefono || "",
      nombre: data?.nombre || "",
      apellido: data?.apellido || "",
      direccion: data?.direccion || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      setLoading(false);
      return;
    }

    if (user?.perfil) {
      // Pre-populate the form with user data
      profileForm.reset({
        cedula: data?.cedula || "",
        numeroTelefono: data?.numeroTelefono || data?.telefono || "",
        nombre: data?.nombre || "",
        apellido: data?.apellido || "",
        direccion: data?.direccion || "",
        email: data?.usuario?.email || "",
      });
    }

    setLoading(false);
  }, [isAuthenticated, user, profileForm]);

  const handleAuthModalClose = (open: boolean) => {
    setIsAuthModalOpen(open);
    if (!open && !isAuthenticated) {
      navigate("/");
    }
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user?.perfil?.id) {
      toast({
        title: "Error",
        description: "Usuario no identificado. Por favor, inicie sesión nuevamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Update profile in the backend
      await profileService.updateProfile(user.perfil.id, data);
      await userService.updateUser(user.perfil.id, {email: data.email});
      // Update local co ntext
      updateProfile({
        ...user.perfil,
        ...data
      });

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error al crear producto:", (error as Error)?.message);
      const oraciones = (error as Error)?.message.split('.').filter(oracion => oracion.trim().length > 0);
      
      toast({
        title: "Error",
        description: oraciones.map(oracion => {
          return <p key={oracion}>● {oracion.trim()}<br/></p>;
        }),
        variant: "destructive",
      });
    
    } finally {
      setSaving(false);
    }
  };

  const handleRecoverySubmit = async (values: RecoveryFormValues) => {
    setIsSubmitting(true);
    try {
      // Aquí iría la llamada a tu servicio de recuperación de contraseña
      await authService.forgotPassword(values.email);
      
      toast({
        title: "Correo enviado",
        description: "Si el correo existe, recibirás instrucciones para cambiar tu contraseña",
      });
      setIsRecoveryOpen(false);
      recoveryForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al enviar el correo",
        description: (error as Error)?.message || "Ocurrió un error al intentar cambiar tu contraseña",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="flex items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Cargando perfil...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Vista General</TabsTrigger>
              <TabsTrigger value="edit" onClick={() => setIsEditing(true)}>
                Editar Información
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="view">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">


                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <p className="font-medium">{data?.cedula || "No especificada"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{data?.numeroTelefono || data?.telefono || "No especificado"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Dirección</p>
                            <p className="font-medium">{data?.direccion || "No especificada"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{data?.usuario?.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Rol</p>
                        <Badge className={getRoleBadgeColor(data?.usuario?.rol || "Usuario")}>
                          {data?.usuario?.rol || "Usuario"}
                        </Badge>
                      </div>
                    </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tienes un perfil asociado.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="edit">
              <div className="grid gap-6 md:grid-cols-1">
                {/* Información Personal */}
                <Card>
                  <CardHeader className="grid md:grid-cols-2">
                    <div>
                      <CardTitle>Información Personal</CardTitle>
                      <CardDescription>
                        Actualiza tu información personal y de contacto
                      </CardDescription>
                    </div>
                    
                    <div className="ml-auto flex items-end gap-2">
                      <Button variant="outline" onClick={() => setIsRecoveryOpen(true)}>
                        Cambiar contraseña
                      </Button>
                    </div>
                  </CardHeader>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="nombre"
                            render={({ field }) => (
                              <FormItem>
                                <Label>Nombre</Label>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Tu nombre" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="apellido"
                            render={({ field }) => (
                              <FormItem>
                                <Label>Apellido</Label>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Tu apellido" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="cedula"
                            render={({ field }) => (
                              <FormItem>
                                <Label>Cédula</Label>
                                <FormControl>
                                  <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Tu número de cédula" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="numeroTelefono"
                            render={({ field }) => (
                              <FormItem>
                                <Label>Teléfono</Label>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="0414-1234567" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <Label>Correo electrónico</Label>
                              <FormControl>
                                <div className="relative">
                                  <Send className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Tu correo electrónico" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="direccion"
                          render={({ field }) => (
                            <FormItem>
                              <Label>Dirección</Label>
                              <FormControl>
                                <div className="relative">
                                  <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Tu dirección" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        </div>


                        
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        <Button 
                        type="button"
                    variant="cancel"
                    onClick={() => {
                      setIsEditing(false);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                        <Button
                          type="submit"
                          className="flex items-center gap-2"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Guardar cambios
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={handleAuthModalClose}
        initialMode="login"
      />

      <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico para recibir instrucciones.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...recoveryForm}>
            <form onSubmit={recoveryForm.handleSubmit(handleRecoverySubmit)} className="space-y-4">
              <FormField
                control={recoveryForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Ingresa tu correo electrónico"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar instrucciones
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;