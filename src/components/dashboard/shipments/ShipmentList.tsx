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
import { Edit, Eye, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const paymentTypes = [
  { value: "all", label: "Todos los métodos" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "PAGOMOVIL", label: "Pago Móvil" },
  { value: "ZELLE", label: "Zelle" },
  { value: "EFECTIVO", label: "Efectivo" },
];

export default function ShipmentList() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter shipments based on payment method and search term
  const filteredShipments = shipments.filter((shipment: any) => {
    // Filter by payment method
    if (paymentFilter !== "all") {
      const hasMatchingPayment = shipment.pedido?.pagos?.some(
        (pago: any) => pago.nombreFormaDePago === paymentFilter
      );
      if (!hasMatchingPayment) return false;
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
        <Button asChild>
          <Link to="/dashboard/envios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Envío
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
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
        <Select 
          value={paymentFilter} 
          onValueChange={(value) => {
            setPaymentFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por método de pago" />
          </SelectTrigger>
          <SelectContent>
            {paymentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                    setPaymentFilter("all");
                    setSearchTerm("");
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