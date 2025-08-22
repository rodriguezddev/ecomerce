import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shippingCompanyService } from "@/services/api-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShippingCompany {
  id: number;
  nombre: string;
}

const shippingCompanySchema = z.object({
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .regex(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/, "El nombre solo puede contener letras y espacios."),
});

type ShippingCompanyFormValues = z.infer<typeof shippingCompanySchema>;

export default function ShippingCompanies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ShippingCompany | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up form with react-hook-form
  const form = useForm<ShippingCompanyFormValues>({
    resolver: zodResolver(shippingCompanySchema),
    defaultValues: {
      nombre: "",
    },
  });

  // Reset form when dialog opens/closes or when editing a different company
  useEffect(() => {
    if (selectedCompany) {
      form.reset({ nombre: selectedCompany.nombre });
    } else {
      form.reset({ nombre: "" });
    }
  }, [selectedCompany, form]);

  // Get all shipping companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["shippingCompanies"],
    queryFn: shippingCompanyService.getShippingCompanies,
  });

  // Filter companies based on search term
  const filteredCompanies = companies.filter((company: ShippingCompany) =>
    company.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Create shipping company mutation
  const createMutation = useMutation({
    mutationFn: shippingCompanyService.createShippingCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingCompanies"] });
      toast({
        title: "Éxito",
        description: "Empresa de envío creada correctamente",
      });
      setIsDialogOpen(false);
      setCurrentPage(1); // Reset to first page after creation
    },
    onError: (error) => {
      console.error("Error al guardar usuario:", (error as Error)?.message);
      const oraciones = (error as Error)?.message.split('.').filter(oracion => oracion.trim().length > 0);
      
      toast({
        title: "Error",
        description: oraciones.map(oracion => {
          return <p key={oracion}>● {oracion.trim()}<br/></p>;
        }),
        variant: "destructive",
      });
    },
  });

  // Update shipping company mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre: string } }) =>
      shippingCompanyService.updateShippingCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingCompanies"] });
      toast({
        title: "Éxito",
        description: "Empresa de envío actualizada correctamente",
      });
      setIsDialogOpen(false);
      setSelectedCompany(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar empresa de envío: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete shipping company mutation
  const deleteMutation = useMutation({
    mutationFn: shippingCompanyService.deleteShippingCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingCompanies"] });
      toast({
        title: "Éxito",
        description: "Empresa de envío eliminada correctamente",
      });
      // Adjust current page if deleting the last item on the page
      if (paginatedCompanies.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar empresa de envío: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: ShippingCompanyFormValues) => {
    if (selectedCompany) {
      updateMutation.mutate({ id: selectedCompany.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  // Open dialog for create or update
  const handleOpenDialog = (company?: ShippingCompany) => {
    setSelectedCompany(company || null);
    setIsDialogOpen(true);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Empresas de Envío</h1>
        <Button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Nueva Empresa</span>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            placeholder="Buscar empresas..."
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
          {isLoading ? (
            <p className="text-center py-4">Cargando empresas...</p>
          ) : companies.length === 0 ? (
            <p className="text-center py-4">
              No hay empresas de envío registradas
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.map((company: ShippingCompany) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.id}</TableCell>
                      <TableCell>{company.nombre}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(company)}
                        >
                          <Pencil className="h-4 w-4" />
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
                                permanentemente la empresa de envío "
                                {company.nombre}" de nuestros servidores.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(company.id)}
                              >
                                Continuar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              <div className="flex items-center justify-between px-4 py-2 border-t mt-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} empresas
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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCompany
                ? "Editar Empresa de Envío"
                : "Nueva Empresa de Envío"}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany
                ? "Actualice los datos de la empresa de envío"
                : "Ingrese los datos de la nueva empresa de envío"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando..."
                    : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}