import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invoiceService } from "@/services/api-extensions";
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

export default function InvoiceList() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: invoices = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await invoiceService.getInvoices();
      return response || [];
    },
  });

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter((invoice: any) => 
    invoice.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id?.toString().includes(searchTerm) ||
    (invoice.pedido?.id?.toString().includes(searchTerm) ||
    (invoice.pago?.id?.toString().includes(searchTerm))
  ));

  // Pagination logic
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  const confirmDelete = (id: number) => {
    setInvoiceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (invoiceToDelete === null) return;

    try {
      await invoiceService.deleteInvoice(invoiceToDelete);
      toast({
        title: "Recibo de entrega eliminada",
        description: "El recibo de entrega ha sido eliminada correctamente",
      });
      refetch();
      // Adjust current page if deleting the last item on the page
      if (paginatedInvoices.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error al eliminar el recibo de entrega:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el recibo de entrega",
        variant: "destructive",
      });
    } finally {
      setInvoiceToDelete(null);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando recibos de entrega...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Error al cargar los recibo de entrega</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de recibo de entrega</h1>
        {/* <Button asChild>
          <Link to="/dashboard/recibo/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva recibo de entrega
          </Link>
        </Button> */}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            placeholder="Buscar recibos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No hay recibo de entrega disponibles
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        #{invoice.id}
                      </TableCell>
                      <TableCell>{invoice.descripcion}</TableCell>
                      <TableCell>
                        {typeof invoice.pedido === "string"
                          ? `#${invoice.pedido}`
                          : `#${invoice.pedido?.id || "N/A"}`}
                      </TableCell>
                      <TableCell>
                        {typeof invoice.pago === "string"
                          ? `#${invoice.pago}`
                          : `#${invoice.pago?.id || "N/A"}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/recibo/${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/dashboard/recibo/editar/${invoice.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(invoice.id!)}
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
                                  eliminará permanentemente el recibo de entrega de
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
                          </AlertDialog>
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
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} recibos
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