import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Shield, FileText, Phone, MapPin, Edit } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => {
      if (!id) throw new Error("User ID is required");
      return userService.getUserById(Number(id));
    },
    enabled: !!id,
  });

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

        <Card className="lg:col-span-2">
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
      
      <div className="flex justify-end gap-2">
        <Button asChild>
          <Link to={`/dashboard/usuarios/editar/${user.id}`}>
            <Edit className="mr-2 h-4 w-4" /> Editar Usuario
          </Link>
        </Button>
      </div>
    </div>
  );
}