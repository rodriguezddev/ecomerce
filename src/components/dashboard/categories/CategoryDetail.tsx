import React from 'react';
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { categoryService } from "@/services/api";
import { categoryServiceExtensions } from "@/services/api-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, X, Loader2, Pencil, Tag, Percent, Package } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const categorySchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").regex(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/, "El nombre solo puede contener letras y espacios"),
  descuento: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "El descuento debe ser mayor o igual a 0").max(100, "El descuento no puede ser mayor a 100%")
  ),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("view");

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: "",
      descuento: 0,
    },
  });

  // Obtener todas las categorías
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  // Buscar la categoría específica por ID
  const category = categories.find((c: any) => c.id === Number(id));

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormValues }) =>
      categoryServiceExtensions.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
      });
      setActiveTab("view");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar categoría: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        nombre: category.nombre,
        descuento: category.descuento,
      });
    }
  }, [category, form]);

  const onSubmit = (values: CategoryFormValues) => {
    if (!id) return;

    const dataToUpdate: Partial<CategoryFormValues> = {};
    const { dirtyFields } = form.formState;

    if (dirtyFields.nombre) dataToUpdate.nombre = values.nombre;
    if (dirtyFields.descuento) dataToUpdate.descuento = values.descuento;

    if (Object.keys(dataToUpdate).length > 0) {
      updateMutation.mutate({ id: Number(id), data: dataToUpdate });
    } else {
      toast({ title: "Sin cambios", description: "No se ha modificado ningún campo." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error al cargar la categoría</p>
        <Button onClick={() => navigate("/dashboard/categorias")}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/categorias")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Detalles de la Categoría</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Vista General</TabsTrigger>
              <TabsTrigger value="edit">Editar Información</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold">Información de la Categoría</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <Tag className="h-5 w-5 text-muted-foreground" />
                          <Badge variant="outline" className="text-sm">
                            Categoría #{category.id}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Nombre</p>
                            <p className="font-medium">{category.nombre}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Percent className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Descuento</p>
                            <p className="font-medium">{category.descuento}%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Productos asociados</p>
                            <p className="font-medium">{category.productos ? category.productos.length : 0} productos</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Estadísticas</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm font-medium">ID</span>
                          <span className="text-sm text-muted-foreground">#{category.id}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm font-medium">Estado</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Activa
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm font-medium">Descuento aplicado</span>
                          <span className="text-sm text-muted-foreground">
                            {category.descuento > 0 ? "Sí" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="edit">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Principal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Categoría</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de la categoría" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descuento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descuento (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Porcentaje de descuento" 
                              min="0" 
                              max="100" 
                              step="0.01" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Información Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Sobre los descuentos</h4>
                      <p className="text-sm text-muted-foreground">
                        El descuento aplica automáticamente a todos los productos de esta categoría
                        que no tengan un descuento individual configurado.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium mb-2 text-blue-800">Consideraciones</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• El descuento debe ser entre 0% y 100%</li>
                        <li>• Los productos pueden tener descuentos individuales</li>
                        <li>• El descuento de categoría no se aplica si el producto tiene descuento individual</li>
                        <li>• Los cambios se reflejarán en todos los productos asociados</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      <div className="flex gap-2 justify-between">
          {activeTab === "edit" ? (
            <>
              <Button
                variant="cancel"
                onClick={() => setActiveTab("view")}
              >
                Cancelar
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </>
          ) : (
            <div></div>
          )}
        </div>
    </div>
  );
}