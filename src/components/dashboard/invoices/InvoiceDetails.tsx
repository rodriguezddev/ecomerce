import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from 'react-to-print';
import { useParams, useNavigate, Link } from "react-router-dom";
import { invoiceService } from "@/services/api-extensions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Printer, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { orderService } from "@/services/api";
import { InvoicePDF } from "./InvoicePDF";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descuento?: number;
}

interface Item {
  id: number;
  cantidad: number;
  producto: Producto;
}

interface Perfil {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  direccion: string;
  numeroTelefono: string;
}

interface Pago {
  id: number;
  nombreFormaDePago: string;
  monto: number;
  numeroReferencia?: string;
  fecha: string;
}

interface Pedido {
  id: number;
  items: Item[];
  perfil: Perfil;
  pagos: Pago[];
  fecha: string;
  factura?: {
    id: number;
    descripcion: string;
    fecha: string;
  };
}

export default function InvoiceDetails({isShowEditButton = true}) {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [invoiceDetails, setInvoiceDetails] = useState<Pedido[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const pdfRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        font-family: Arial, sans-serif;
      }
    `
  });

  const { data: invoice, isLoading, isError, error } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => {
      if (!id) throw new Error("Invoice ID is required");
      return invoiceService.getInvoiceById(Number(id));
    },
    enabled: !!id,
  });

  const { data: orders } = useQuery({
    queryKey: ["order", id],
    queryFn: () => {
      if (!id) throw new Error("Order ID is required");
      return orderService.getOrders();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error al cargar el recibo:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del recibo.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  useEffect(() => {
    if (orders && orders.length !== 0) {
      const details = orders.filter((detail) => detail?.factura?.id == id);
      setInvoiceDetails(details);
    }
  }, [orders, id]);

  // Pagination logic
  const items = invoiceDetails[0]?.items || [];
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const calculateSubtotal = () => {
    if (!invoiceDetails[0]?.items) return 0;
    return invoiceDetails[0].items.reduce((sum: number, item: Item) => {
      const precioConDescuento = item.producto.descuento
        ? item.producto.precio * (1 - item.producto.descuento / 100)
        : item.producto.precio;
      return sum + (item.cantidad * precioConDescuento);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const totalDescuentos = invoiceDetails[0]?.items?.reduce((sum, item) => {
    return item.producto.descuento
      ? sum + (item.cantidad * item.producto.precio * item.producto.descuento / 100)
      : sum;
  }, 0) || 0;

  const total = subtotal;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando detalles del recibo...</div>;
  }

  if (isError || !invoice) {
    return <div className="text-red-500 text-center">Error al cargar los detalles del recibo.</div>;
  }

  return (
    <div className="space-y-6 print:space-y-2">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Detalles del Recibo #{invoice.id}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          {isShowEditButton && (
            <Button asChild>
              <Link to={`/dashboard/recibo/editar/${invoice.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Editar Recibo
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Recibo de Entrega #{invoice.id}</CardTitle>
              <p className="text-muted-foreground">{invoice.descripcion}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Repuestos y Accesorios M&C7, C.A.</p>
              <p className="text-sm text-muted-foreground">RIF: J-50325744-7</p>
              <p className="text-sm text-muted-foreground">Naguanagua, Carabobo</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Cliente:</h3>
              {invoiceDetails[0]?.perfil ? (
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {invoiceDetails[0].perfil.nombre} {invoiceDetails[0].perfil.apellido}
                  </p>
                  <p className="text-muted-foreground">C.I: {invoiceDetails[0].perfil.cedula}</p>
                  <p className="text-muted-foreground">{invoiceDetails[0].perfil.direccion}</p>
                  <p className="text-muted-foreground">{invoiceDetails[0].perfil.numeroTelefono}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin información del cliente.</p>
              )}
            </div>
            {invoiceDetails[0] && (
              <div className="text-left md:text-right">
                <h3 className="font-semibold mb-2">Detalles del Pedido:</h3>
                <div className="text-sm text-muted-foreground">
                  <p><strong>ID Pedido:</strong> #{invoiceDetails[0].id}</p>
                  <p><strong>Fecha Pedido:</strong> {formatDate(new Date(invoiceDetails[0].fecha))}</p>
                  <p><strong>Forma de Pago:</strong> {
                    invoiceDetails[0].pagos?.map(pago => pago.nombreFormaDePago).join(', ') || 'N/A'
                  }</p>
                  {invoiceDetails[0].pagos?.[0]?.numeroReferencia && (
                    <p><strong>Referencia:</strong> {invoiceDetails[0].pagos[0].numeroReferencia}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unitario</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item: Item) => {
                const precioConDescuento = item.producto.descuento
                  ? item.producto.precio * (1 - item.producto.descuento / 100)
                  : item.producto.precio;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                    <TableCell className="text-center">{item.cantidad}</TableCell>
                    <TableCell className="text-right">${item.producto.precio.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {item.producto.descuento ? `${item.producto.descuento}%` : '-'}
                    </TableCell>
                    <TableCell className="text-right">${(item.cantidad * precioConDescuento).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t mt-4 print:hidden">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} productos
                </p>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 50].map((size) => (
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
          <div className="w-full max-w-xs ml-auto text-sm">
            {totalDescuentos > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuentos totales:</span>
                <span className="text-green-600">-${totalDescuentos.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="hidden print:block">
        <div ref={pdfRef}>
          <InvoicePDF invoice={invoice} invoiceDetails={invoiceDetails} />
        </div>
      </div>
    </div>
  );
}