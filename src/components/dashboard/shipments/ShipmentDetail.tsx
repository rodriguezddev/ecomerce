import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { shippingCompanyService } from "@/services/api-extensions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Edit, Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ShipmentDetail() {
  const { id } = useParams();
  const { toast } = useToast();

  const {
    data: shipment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shipment", id],
    queryFn: async () => {
      const response = await shippingCompanyService.getShipmentById(Number(id));
      return response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando detalles del envío...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Error al cargar los detalles del envío</p>
        <Button asChild variant="outline" className="mt-2">
          <Link to="/dashboard/envios">
            Volver a la lista
          </Link>
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La impresión de guías estará disponible pronto",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La descarga de guías estará disponible pronto",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link to="/dashboard/envios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Detalles del Envío #{shipment.id}</h1>
        </div>
        <div className="flex gap-2">

          <Button asChild>
            <Link to={`/dashboard/envios/editar/${shipment.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Actualizar envío
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información de la empresa y guía */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Empresa:</span>
              <span>{shipment.empresa?.nombre || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Número de Guía:</span>
              <span>{shipment.numeroDeGuia || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Método de Entrega:</span>
              <Badge variant="outline">{shipment.metodoDeEntrega}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Dirección:</span>
              <span>{shipment.direccionEmpresa || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Información del destinatario */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Destinatario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Nombre:</span>
              <span>{shipment.destinatarioNombre} {shipment.destinatarioApellido}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Cédula:</span>
              <span>{shipment.destinatarioCedula || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Teléfono:</span>
              <span>{shipment.destinatarioTelefono || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Información del pedido */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">ID del Pedido:</span>
              <Badge variant="outline">#{shipment.pedido?.id || "N/A"}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tipo de Pedido:</span>
              <span>{shipment.pedido?.tipoDePedido || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Estado:</span>
              <Badge variant={
                shipment.pedido?.estado === "Pedido enviado" ? "default" : "secondary"
              }>
                {shipment.pedido?.estado || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Pagado:</span>
              <Badge variant={shipment.pedido?.pagado ? "default" : "destructive"}>
                {shipment.pedido?.pagado ? "Sí" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Fecha:</span>
              <span>
                {shipment.pedido?.fecha 
                  ? new Date(shipment.pedido.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Foto de la guía */}
        {shipment.fotoGuia && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Foto de la Guía</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img 
                  src={`${import.meta.env.VITE_API_URL}imagenes/${shipment.fotoGuia}`} 
                  alt="Foto de la guía de envío"
                  className="max-w-full h-auto rounded-md border"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}