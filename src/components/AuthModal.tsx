
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Mail, Lock, User, Phone, CreditCard, Home } from "lucide-react";
import { authService, User as UserType } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "register";
}

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "register";
}

// Esquema para recuperación de contraseña
const recoverySchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido" }),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

// Login form schema
const loginSchema = z.object({
  username: z.string().min(2, { message: "Por favor ingresa un nombre de usuario válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(2, { message: "El nombre de usuario debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Por favor ingresa una dirección de correo electrónico válida" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z.string(),
  nombre: z.string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .regex(/^[a-zA-Z\s]+$/, { message: "El nombre solo puede contener letras y espacios" }),
  apellido: z.string()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres" })
    .regex(/^[a-zA-Z\s]+$/, { message: "El apellido solo puede contener letras y espacios" }),
  cedula: z.string()
    .min(6, { message: "La cédula debe tener al menos 6 caracteres" })
    .regex(/^[0-9]+$/, { message: "La cédula solo puede contener números" }),
  numeroTelefono: z.string()
    .min(10, { message: "El número de teléfono debe tener al menos 10 caracteres" })
    .regex(/^\d{4}-\d{7}$/, { message: "El formato del teléfono debe ser 0414-1234567" }),
  direccion: z.string().min(6, { message: "La dirección debe tener al menos 6 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthModal({ isOpen, onOpenChange, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [userId, setUserId] = useState('');
  
  // const [isLoading, setIsLoading] = useState(false); // Replaced by isSubmitting for consistency
  const { login, register, updateProfile } = useAuth();
  const { toast } = useToast();

  

    const recoveryForm = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: "",
    },
  });


  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      nombre: "",
      apellido: "",
      cedula: "",
      numeroTelefono: "",
      direccion: "",
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        onOpenChange(false);
        loginForm.reset();
        setUserId(success.profileId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
  
    try {
      const profileToRegister: UserType = {
        password: values.password,
        username: values.username,
        email: values.email,
        rol: "Cliente",
        perfil: {
          cedula: values.cedula,
          numeroTelefono: values.numeroTelefono,
          nombre: values.nombre,
          apellido: values.apellido,
          direccion: values.direccion,
        }
      };
  
      const data = await authService.register(profileToRegister as z.infer<typeof registerSchema>);
      setUserId(data.profileId);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada",
      });
      onOpenChange(false);
      registerForm.reset();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Falló el registro",
        // Here's the key change: use the error.message from your service
        description: (error as Error)?.message || "Ocurrió un error inesperado al registrarte. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

    const handleRecoverySubmit = async (values: RecoveryFormValues) => {
    setIsSubmitting(true);
    try {
      // Aquí iría la llamada a tu servicio de recuperación de contraseña
      await authService.forgotPassword(values.email);
      
      toast({
        title: "Correo enviado",
        description: "Si el correo existe, recibirás instrucciones para recuperar tu contraseña",
      });
      setIsRecoveryOpen(false);
      recoveryForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al enviar el correo",
        description: (error as Error)?.message || "Ocurrió un error al intentar recuperar tu contraseña",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Inicia Sesión en Tu Cuenta" : "Crea una Cuenta"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" 
              ? "Ingresa tus credenciales para acceder a tu cuenta."
              : "Completa el formulario a continuación para crear tu cuenta."}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Ingresa tu nombre de usuario" 
                          className="pl-10" 
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          className="pl-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Agregar este enlace para recuperar contraseña */}
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground p-0 h-auto"
                    onClick={() => setIsRecoveryOpen(true)}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>

              <DialogFooter className="flex-col gap-2 sm:gap-0">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ingresar
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={switchMode}
                >
                  ¿No tienes una cuenta? Regístrate
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Información de la Cuenta</h3>
                
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de usuario</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Ingresa tu nombre de usuario"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
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
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Crea una contraseña"
                              className="pl-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                              onClick={() => setShowPassword((prev) => !prev)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirma la contraseña"
                              className="pl-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}>
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">Información Personal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ingresa tu nombre"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ingresa tu apellido"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="cedula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Cédula</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Ingresa tu número de cédula"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="numeroTelefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Teléfono</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Ingresa tu número de teléfono"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={registerForm.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Ingresa tu dirección"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex-col gap-2 sm:gap-0 pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrarse
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={switchMode}
                >
                  ¿Ya tienes una cuenta? Inicia Sesión
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>

     <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico para recibir instrucciones de recuperación.
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
      </>
  );
}
