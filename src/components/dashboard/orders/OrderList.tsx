import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/api-extensions";
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
import {
  Edit,
  Eye,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const OrderStatusBadge = ({ status }: { status: string }) => {
  let color = "";

  switch (status.toLowerCase()) {
    case "pedido en verificacion de pago":
      color = "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      break;
    case "pedido pagado":
    case "pagado":
      color = "bg-green-100 hover:bg-green-200 text-green-800";
      break;
    case "enviado":
      color = "bg-blue-100 hover:bg-blue-200 text-blue-800";
      break;
    case "cancelado":
      color = "bg-red-100 hover:bg-red-200 text-red-800";
      break;
    default:
      color = "bg-gray-100 hover:bg-gray-200 text-gray-800";
  }

  return (
    <Badge className={`${color}`} variant="outline">
      {status}
    </Badge>
  );
};

export default function OrderList() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await orderService.getOrders();
      return response || [];
    },
  });

  // Filter orders based on search term and date
  const filteredOrders = orders.filter((order: any) => {
    const searchLower = searchTerm.toLowerCase();
    const orderDate = new Date(order.fecha);

    // Check search term
    const searchMatch =
      order.id.toString().includes(searchLower) ||
      order.perfil?.nombre?.toLowerCase().includes(searchLower) ||
      order.perfil?.apellido?.toLowerCase().includes(searchLower) ||
      order.estado.toLowerCase().includes(searchLower) ||
      formatDate(orderDate).toLowerCase().includes(searchLower);

    // Check date filter
    const dateMatch = dateFilter
      ? orderDate.toDateString() === dateFilter.toDateString()
      : true;

    return searchMatch && dateMatch;
  });

  // Pagination logic
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const confirmDelete = (id: number) => {
    setOrderToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (orderToDelete === null) return;

    try {
      await orderService.deleteOrder(orderToDelete);
      toast({
        title: "Pedido eliminado",
        description: "El pedido ha sido eliminado correctamente",
      });
      refetch();
      // Adjust current page if deleting the last item on the page
      if (paginatedOrders.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error al eliminar el pedido:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pedido",
        variant: "destructive",
      });
    } finally {
      setOrderToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const clearDateFilter = () => {
    setDateFilter(undefined);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Error al cargar los pedidos</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <Button asChild>
          <Link to="/dashboard/pedidos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Link>
        </Button>
      </div>

      <div className="flex justify-start items-center gap-4 mb-4">
        <div className="relative w-64">
          <Input
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>

        <div className="flex items-center gap-2">
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
                {dateFilter ? (
                  formatDate(dateFilter)
                ) : (
                  <span>Filtrar por fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={dateFilter}
                onSelect={(date) => {
                  setDateFilter(date);
                  setCurrentPage(1);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {dateFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearDateFilter}
              title="Limpiar filtro de fecha"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No hay pedidos disponibles
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No se encontraron pedidos con los filtros aplicados
              </p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter(undefined);
                  setCurrentPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order: any) => {
                    // Calculate total
                    const total =
                      order.items?.reduce((sum: number, item: any) => {
                        return sum + item.cantidad * item.producto.precio;
                      }, 0) || 0;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(order.fecha))}
                        </TableCell>
                        <TableCell>
                          {order.perfil?.nombre} {order.perfil?.apellido}
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.estado} />
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.pagado ? "default" : "outline"}>
                            {order.pagado ? "Sí" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>${total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/dashboard/pedidos/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {/* <Button variant="ghost" size="icon" asChild>
                              <Link
                                to={`/dashboard/pedidos/editar/${order.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button> */}
                            {/* <AlertDialog open={isDeleteDialogOpen && orderToDelete === order.id} onOpenChange={setIsDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete(order.id!)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Estás absolutamente seguro?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto
                                    eliminará permanentemente el pedido de
                                    nuestros servidores.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                  >
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction onClick={executeDelete}>
                                    Continuar
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
                      Mostrando {startIndex + 1}-
                      {Math.min(endIndex, totalItems)} de {totalItems} pedidos
                    </p>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={handleItemsPerPageChange}
                    >
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
