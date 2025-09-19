import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { shippingCompanyService } from "@/services/api-extensions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Eye, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Cambiar los tipos de filtro de método de pago a método de entrega
const deliveryMethods = [
  { value: "all", label: "Todos los métodos" },
  { value: "Retiro en tienda", label: "Retiro en tienda" },
  { value: "Delivery", label: "Delivery" },
  { value: "Envio nacional", label: "Envío nacional" },
];

// Función para formatear fecha sin hora
const formatDateWithoutTime = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export default function ShipmentList() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const {
    data: shipments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const response = await shippingCompanyService.getShipments();
      return response || [];
    },
  });

  // Filter shipments based on delivery method, search term and date
  const filteredShipments = shipments.filter((shipment: any) => {
    // Filter by delivery method
    if (deliveryFilter !== "all" && shipment.metodoDeEntrega !== deliveryFilter) {
      return false;
    }

    // Filter by date
    if (dateFilter && shipment.fecha) {
      const shipmentDate = new Date(shipment.fecha);
      const filterDate = new Date(dateFilter);
      
      if (
        shipmentDate.getDate() !== filterDate.getDate() ||
        shipmentDate.getMonth() !== filterDate.getMonth() ||
        shipmentDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }

    // Filter by search term
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      shipment.id.toString().includes(lowerSearchTerm) ||
      shipment.empresa?.nombre?.toLowerCase().includes(lowerSearchTerm) ||
      shipment.metodoDeEntrega?.toLowerCase().includes(lowerSearchTerm) ||
      shipment.direccionEmpresa?.toLowerCase().includes(lowerSearchTerm) ||
      (typeof shipment.pedido === "string" 
        ? shipment.pedido.toLowerCase().includes(lowerSearchTerm)
        : shipment.pedido?.id?.toString().includes(lowerSearchTerm))
    );
  });

  // Pagination logic
  const totalItems = filteredShipments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const confirmDelete = (id: number) => {
    setShipmentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (shipmentToDelete === null) return;

    try {
      await shippingCompanyService.deleteShipment(shipmentToDelete);
      toast({
        title: "Envío eliminado",
        description: "El envío ha sido eliminado correctamente",
      });
      refetch();
      if (paginatedShipments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error al eliminar el envío:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el envío",
        variant: "destructive",
      });
    } finally {
      setShipmentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const clearDateFilter = () => {
    setDateFilter(undefined);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando envíos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Error al cargar los envíos</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Envíos</h1>
        
      </div>

      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">

        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
<div className="relative w-64">
          <Input
            placeholder="Buscar envíos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <Select 
            value={deliveryFilter} 
            onValueChange={(value) => {
              setDeliveryFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por método de entrega" />
            </SelectTrigger>
            <SelectContent>
              {deliveryMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"cancel"}
                                className={cn(
                                  "w-[240px] justify-start text-left font-normal",
                                  !dateFilter && "text-muted-foreground"
                                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateFilter ? formatDateWithoutTime(dateFilter) : "Filtrar por fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dateFilter}
                onSelect={(date) => {
                  setDateFilter(date);
                  setCurrentPage(1);
                }}
                initialFocus
              />
              {dateFilter && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={clearDateFilter}
                  >
                    Limpiar filtro de fecha
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        </div>
        

        <Button asChild>
          <Link to="/dashboard/envios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Envío
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          {filteredShipments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                {shipments.length === 0 
                  ? "No hay envíos disponibles" 
                  : "No hay envíos que coincidan con los filtros"}
              </p>
              {shipments.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => {
                    setDeliveryFilter("all");
                    setSearchTerm("");
                    setDateFilter(undefined);
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Método de Entrega</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Método de pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedShipments.map((shipment: any) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">
                        #{shipment.id}
                      </TableCell>
                      <TableCell>{shipment.empresa?.nombre || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {shipment.metodoDeEntrega}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.direccionEmpresa}</TableCell>
                      <TableCell>
                        {shipment.fecha ? formatDateWithoutTime(new Date(shipment.fecha)) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {typeof shipment.pedido === "string" ? (
                          <Badge variant="outline">#{shipment.pedido}</Badge>
                        ) : (
                          <Badge variant="outline">
                            #{shipment.pedido?.id || "N/A"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {shipment.pedido?.pagos?.map((pago: any, index: number) => (
                          <div key={index} className="mb-1">
                            <Badge variant="secondary" className="mr-1">
                              {pago.nombreFormaDePago === 'PAGOMOVIL' ? 'PAGO MOVIL' : pago.nombreFormaDePago}
                            </Badge>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/envios/${shipment.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
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
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} envíos
                    </p>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((size) => (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}