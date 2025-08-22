import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import CategoryForm from "./CategoryForm";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryServiceExtensions } from "@/services/api-dashboard";

export default function CategoryList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const handleDelete = async (id: number) => {
    try {
      await categoryServiceExtensions.deleteCategory(id);
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente",
      });
      refetch();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch();
    toast({
      title: "Categoría creada",
      description: "La categoría se ha creado correctamente",
    });
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    refetch();
    toast({
      title: "Categoría actualizada",
      description: "La categoría se ha actualizado correctamente",
    });
  };

  const filteredCategories = data?.filter((category: any) => 
    category.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
  const totalItems = filteredCategories?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories?.slice(startIndex, endIndex) || [];

  const confirmDelete = (id: number) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Resetear a la primera página cuando cambia el tamaño de página
  };

  if (isLoading) {
    return <div>Cargando categorías...</div>;
  }

  if (isError) {
    return <div>Error al cargar categorías</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de Categorías</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorías..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Crear Nueva Categoría</DialogTitle>
            <CategoryForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descuento (%)</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((category: any) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.id}</TableCell>
                <TableCell>{category.nombre}</TableCell>
                <TableCell>{category.descuento}%</TableCell>
                <TableCell>{category.productos ? category.productos.length : 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={isDeleteDialogOpen && categoryToDelete === category.id} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro de eliminar esta categoría?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente la categoría y no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={cancelDelete}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(categoryToDelete!)}>
                            Eliminar
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

        {/* Controles de paginación */}
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} categorías
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
      </Card>
      
      {selectedCategory && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogTitle>Editar Categoría</DialogTitle>
            <CategoryForm 
              initialData={selectedCategory}
              onSuccess={handleEditSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}