import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
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
  Edit 
} from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileData {
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
}

const Profile = () => {
  const { isAuthenticated, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      setLoading(false);
      return;
    }

    if (user?.perfil) {
      // Pre-populate the form with user data
      setProfileData({
        nombre: user.perfil.nombre || "",
        apellido: user.perfil.apellido || "",
        telefono: user.perfil.telefono || "",
        direccion: user.perfil.direccion || "",
        ciudad: user.perfil.ciudad || "",
        estado: user.perfil.estado || "",
        codigoPostal: user.perfil.codigoPostal || ""
      });
    }

    setLoading(false);
  }, [isAuthenticated, user]);

  const handleAuthModalClose = (open: boolean) => {
    setIsAuthModalOpen(open);
    if (!open && !isAuthenticated) {
      navigate("/");
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await userService.updateUserProfile(user.perfil.id, profileData);

      // Update local context
      updateProfile({
        ...user.perfil,
        ...profileData
      });

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error al actualizar perfil",
        description: "No se pudo actualizar la información. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "La nueva contraseña y su confirmación deben ser iguales",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Call API to change password
      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      });

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error al cambiar contraseña",
        description: "Asegúrese de que la contraseña actual sea correcta",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Datos de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre de Usuario</p>
                    <p className="font-medium">{user?.username || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rol</p>
                    <Badge className={getRoleBadgeColor(user?.rol || "Usuario")}>
                      {user?.rol || "Usuario"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent>
                {user?.perfil ? (
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
                        <p className="font-medium">{user.perfil.cedula || "No especificada"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{user.perfil.telefono || "No especificado"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:col-span-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Dirección</p>
                        <p className="font-medium">{user.perfil.direccion || "No especificada"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tienes un perfil asociado.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="personal">
            <TabsList className="mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User size={16} />
                <span>Editar Información Personal</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <KeySquare size={16} />
                <span>Seguridad</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Editar Datos Personales</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileSubmit}>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          placeholder="Tu nombre"
                          value={profileData.nombre}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          name="apellido"
                          placeholder="Tu apellido"
                          value={profileData.apellido}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        placeholder="Tu número de teléfono"
                        value={profileData.telefono}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        name="direccion"
                        placeholder="Tu dirección"
                        value={profileData.direccion}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad</Label>
                        <Input
                          id="ciudad"
                          name="ciudad"
                          placeholder="Tu ciudad"
                          value={profileData.ciudad}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          name="estado"
                          placeholder="Tu estado"
                          value={profileData.estado}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="codigoPostal">Código Postal</Label>
                        <Input
                          id="codigoPostal"
                          name="codigoPostal"
                          placeholder="Tu código postal"
                          value={profileData.codigoPostal}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
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
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar contraseña</CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña para mantener tu cuenta segura
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña actual</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        placeholder="Tu contraseña actual"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva contraseña</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Tu nueva contraseña"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      variant="default"
                      className="flex items-center gap-2"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <KeySquare className="h-4 w-4" />
                          Cambiar contraseña
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
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
    </div>
  );
};

export default Profile;