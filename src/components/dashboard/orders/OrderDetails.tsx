import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orderService } from "@/services/api-extensions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, User, Calendar, Hash, Truck, CreditCard, ShoppingBag, FileText, Phone, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrderStatusBadge = ({ status }: { status: string }) => {
  let color = "";

  switch (status.toLowerCase()) {
    case "pedido en verificacion de pago":
      color = "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      break;
    case "pedido pagado":
    case "pagado":
    case "pedido en proceso de empaquetado":
      color = "bg-green-100 hover:bg-green-200 text-green-800";
      break;
    case "pedido enviado":
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

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => {
      if (!id) throw new Error("Order ID is required");
      return orderService.getOrderById(Number(id));
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error al cargar el pedido:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del pedido.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Pagination logic
  const items = order?.items || [];
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando detalles del pedido...</div>;
  }

  if (isError || !order) {
    return <div className="text-red-500 text-center">Error al cargar los detalles del pedido.</div>;
  }

  const calculateTotal = () => {
    return order.items?.reduce((sum: number, item: any) => {
      return sum + item.cantidad * item.producto.precioConDescuento;
    }, 0) || 0;
  };

  const total = calculateTotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Detalles del Pedido #{order.id}</h1>
          {
            order?.estado == "Cancelado" && (
<OrderStatusBadge status={order?.estado ? order?.estado : "-"} />
            )
          }
        </div>
        <div className="flex gap-2">
          {order?.pagado && (
            <Button variant="outline" asChild>
              <Link to={`/dashboard/recibo/${order?.factura?.id}`}>
                <FileText className="mr-2 h-4 w-4" /> Ver Recibo
              </Link>
            </Button>
          )}
          {/* {
            (order?.estado !== "Cancelado" && order?.pagos?.length == 0) && (
              <Button variant="secondary" asChild>
                <Link to={`/dashboard/pagos/nuevo/${order.id}`}>
                  <CreditCard className="mr-2 h-4 w-4" /> Registrar Pago
                </Link>
              </Button>
            )
          } */}
          {
            (order.estado !== "Pedido enviado" && order.estado !== "Cancelado" && order.pagado !== true ) && (
          <Button asChild>
            <Link to={`/dashboard/pedidos/editar/${order.id}`}>
              <Edit className="mr-2 h-4 w-4" /> Actualizar Estatus
            </Link>
          </Button>
            )
}


        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Información del Pedido</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3"><Hash className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">ID del Pedido</p><p className="font-medium">#{order.id}</p></div></div>
              <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Fecha</p><p className="font-medium">{order?.fecha ? formatDate(new Date(order?.fecha)) : "-"}</p></div></div>
              <div className="flex items-center gap-3"><Truck className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Estado</p><OrderStatusBadge status={order?.estado ? order?.estado : "-"} /></div></div>
              <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Pago</p><Badge variant={order?.pagado ? "default" : "outline"}>{order?.pagado ? "Pagado" : "Pendiente"}</Badge></div></div>
              <div className="flex items-center gap-3"><ShoppingBag className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Tipo</p><p className="font-medium">{order?.tipoDePedido}</p></div></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Información del Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {order.perfil ? (
                <>
                  <div className="flex items-center gap-3"><User className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Nombre</p><p className="font-medium">{order.perfil.nombre} {order.perfil.apellido}</p></div></div>
                  <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Cédula</p><p className="font-medium">{order.perfil.cedula}</p></div></div>
                  <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Teléfono</p><p className="font-medium">{order.perfil.numeroTelefono}</p></div></div>
                  <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Dirección</p><p className="font-medium">{order.perfil.direccion}</p></div></div>
                </>
              ) : (
                <p className="text-muted-foreground">No hay información del cliente.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Artículos del Pedido</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                      <TableCell className="text-center">{item.cantidad}</TableCell>
                      <TableCell className="text-right">${(item.producto.precioConDescuento)}</TableCell>
                      <TableCell className="text-right">${(item.cantidad * item.producto.precioConDescuento).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-t mt-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} artículos
                    </p>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[5, 10, 20, 30].map((size) => (
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
            </CardContent>
            <CardFooter className="flex flex-col items-end space-y-2">
              <Separator />
              <div className="flex justify-between w-full text-lg font-semibold pt-4">
                <span>Total del Pedido:</span>
                <span>${total.toFixed(2)}</span>
              </div>

            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}