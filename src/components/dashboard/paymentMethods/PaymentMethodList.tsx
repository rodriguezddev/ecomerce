import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye } from "lucide-react";
import { paymentMethodService } from "@/services/paymentMethodService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

type PaymentMethodType = "EFECTIVO" | "PAGOMOVIL" | "TRANSFERENCIA" | "ZELLE" | "EFECTIVOBS";

interface PaymentMethod {
  id: number;
  tipo: PaymentMethodType;
  email?: string;
  numeroTelefono?: string;
  cedula?: string;
  nombreDeTitular?: string;
  numeroDeCuenta?: string;
  tipoDeCuenta?: "Ahorro" | "Corriente";
  banco?: string;
}

export default function PaymentMethodList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: paymentMethodService.getPaymentMethods,
  });

  const deleteMutation = useMutation({
    mutationFn: paymentMethodService.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Éxito",
        description: "Método de pago eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar método de pago: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  // Filter methods based on search term
  const filteredMethods = methods.filter((method: PaymentMethod) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      method.id.toString().includes(searchLower) ||
      method.tipo.toLowerCase().includes(searchLower) ||
      (method.email?.toLowerCase().includes(searchLower) || false) ||
      (method.numeroTelefono?.toLowerCase().includes(searchLower) || false) ||
      (method.banco?.toLowerCase().includes(searchLower) || false)
    );
  });

  // Pagination logic
  const totalItems = filteredMethods.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMethods = filteredMethods.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Métodos de Pago</h1>
        
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            placeholder="Buscar métodos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link to="/dashboard/metodos-pago/crear">
            <Plus size={16} />
            <span>Nuevo Método</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay métodos de pago registrados</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedMethods.map((method: PaymentMethod) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.id}</TableCell>
                      <TableCell>
                        {method.tipo === "PAGOMOVIL" ? "PAGO MÓVIL" : method.tipo}
                      </TableCell>
                      <TableCell>
                        {method.email && `Email: ${method.email}`}
                        {method.numeroTelefono && `Teléfono: ${method.numeroTelefono}`}{method.numeroTelefono && ' | '}
                        {method.numeroDeCuenta && `Cuenta: ${method.numeroDeCuenta}`}{method.numeroDeCuenta && ' | '}
                        {method.banco && `Banco: ${method.banco}`}{method.banco && ' | '}
                        {method.cedula && `Cedula: ${method.cedula}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/metodos-pago/${method.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Estás absolutamente seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará
                                  permanentemente el método de pago de nuestros servidores.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(method.id)}
                                >
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
                      Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} métodos
                    </p>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={handleItemsPerPageChange}
                    >
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}