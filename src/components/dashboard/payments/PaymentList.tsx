import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/services/api-extensions";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Eye, Trash2, Edit, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderService } from '../../../services/api-dashboard';

// Mapeo de tipos de pago para mostrar nombres más amigables
const paymentTypes = [
  { value: "all", label: "Todos los métodos" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "PAGOMOVIL", label: "Pago Móvil" },
  { value: "ZELLE", label: "Zelle" },
  { value: "EFECTIVO", label: "Efectivo" },
];

export default function PaymentList() {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Array | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("all");
        const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paymentToDelete, setPaymentToDelete] = useState<{
    pedidoId: number;
    id: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await paymentService.getPayments();
      return response || [];
    },
  }); 

  const {
    data: orders = [],
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await orderService.getOrders();
      return response || [];
    },
  }); 

  const confirmDelete = (pedidoId: number, id: number) => {
    setPaymentToDelete({ pedidoId, id });
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!paymentToDelete) return;
    try {
      setIsDeleting(true);
      await paymentService.deletePayment(paymentToDelete.pedidoId, paymentToDelete.id);
      toast({
        title: "Pago eliminado",
        description: "El pago ha sido eliminado correctamente",
      });
      refetch();
      // Adjust current page if deleting the last item on the page
      if (paginatedPayments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error al eliminar pago:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

const handleViewImage = (pagos: any[] | null) => {
  if (pagos && Array.isArray(pagos)) {
    // Extraer todas las imágenes
    const images = pagos
      .filter(pago => pago.image)
      .map(pago => pago.image);
    
    if (images.length > 0) {
      setSelectedImage(images); // Ahora selectedImage sería un array
      setIsModalOpen(true);
    }
  } else if (typeof pagos === 'string') {
    setSelectedImage(pagos);
    setIsModalOpen(true);
  }
};

const filteredPayments = payments?.filter((payment: any) => {
  // Buscar el pedido asociado a este pago en el array de órdenes
  const orderAssociated = orders.find(order => order.id === payment.pedido?.id);
  
  // Excluir pagos cuyo pedido fue cancelado
  if (orderAssociated && orderAssociated.estado === "Cancelado" || orderAssociated && orderAssociated.pagado !== true) {
    return false;
  }
  
  // También excluir pagos que estén marcados como cancelados directamente
  if (payment.cancelado) {
    return false;
  }
  
  // Filtro por tipo de pago
  if (paymentFilter !== "all" && payment.nombreFormaDePago !== paymentFilter) {
    return false;
  }
  
  // Filtro por término de búsqueda
  if (!searchTerm) return true;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  const refMatch = payment.numeroReferencia
    ?.toLowerCase()
    .includes(lowerSearchTerm);
  const dateMatch =
    payment.fecha &&
    formatDate(new Date(payment.fecha)).toLowerCase().includes(lowerSearchTerm);
  return refMatch || dateMatch;
});

  // Pagination logic
  const totalItems = filteredPayments?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments?.slice(startIndex, endIndex) || [];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando pagos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Error al cargar los pagos</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
        
      </div>
      <div className="flex justify-between items-center mb-6 ">
<div className="flex justify-between items-center gap-4 ">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por referencia o fecha..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          <Select value={paymentFilter} onValueChange={(value) => {
            setPaymentFilter(value);
            setCurrentPage(1); // Reset to first page when changing filter
          }}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por método" />
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
      </div>
      
      <Card>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No hay pagos disponibles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número Referencia</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Forma de Pago</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map((payment: any) => {
                    const pedidoId =
                      typeof payment.pedido === "object"
                        ? payment.pedido.id
                        : payment.pedido;

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.numeroReferencia}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">#{pedidoId}</Badge>
                        </TableCell>
                        <TableCell>
                          {payment.nombreFormaDePago === 'PAGOMOVIL' 
                            ? 'PAGO MOVIL' 
                            : payment.nombreFormaDePago}
                        </TableCell>
                        <TableCell>
                          {payment.fecha ? formatDate(new Date(payment.fecha)) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewImage(payment.pedido.pagos)}
                              disabled={!payment?.pedido.pagos[0]?.image}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* <Button variant="ghost" size="icon" asChild>
                              <Link to={`/dashboard/pagos/editar/${payment.numeroReferencia}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete(pedidoId, payment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el pago.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={executeDelete}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Eliminando..." : "Eliminar"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} pagos
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


<Dialog open={isModalOpen} onOpenChange={(open) => {
  setIsModalOpen(open);
  if (!open) setCurrentImageIndex(0); // Reset al cerrar
}}>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>
        {Array.isArray(selectedImage) 
          ? `Comprobante ${currentImageIndex + 1} de ${selectedImage.length}`
          : 'Comprobante de Pago'
        }
      </DialogTitle>
    </DialogHeader>
    
    {selectedImage && (
      <div className="relative">
        {Array.isArray(selectedImage) && selectedImage.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
              onClick={() => setCurrentImageIndex(prev => 
                prev > 0 ? prev - 1 : selectedImage.length - 1
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
              onClick={() => setCurrentImageIndex(prev => 
                prev < selectedImage.length - 1 ? prev + 1 : 0
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <img
          src={`${import.meta.env.VITE_API_URL}imagenes/${
            Array.isArray(selectedImage) 
              ? selectedImage[currentImageIndex] 
              : selectedImage
          }`}
          alt="Comprobante de pago"
          className="w-full h-auto object-contain rounded-md mt-4 max-h-[70vh]"
        />
        
        {Array.isArray(selectedImage) && selectedImage.length > 1 && (
          <div className="flex justify-center mt-2 space-x-1">
            {selectedImage.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex 
                    ? 'bg-primary' 
                    : 'bg-muted'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </DialogContent>
</Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}