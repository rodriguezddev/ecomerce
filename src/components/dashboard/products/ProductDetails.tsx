import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { productService, Product, categoryService } from "@/services/api";
import { productServiceExtensions } from "@/services/api-dashboard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, DollarSign, Package, Layers, Percent, Save, X, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const productSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido.")
    .regex(
      /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ'-]+$/,
      "El nombre solo puede contener letras, espacios, apóstrofes y guiones."
    ),
  descripcion: z
    .string()
    .min(1, "La descripción es requerida.")
    .max(500, "La descripción no puede exceder los 500 caracteres."),
  precio: z.coerce
    .number({
      required_error: "El precio es requerido.",
      invalid_type_error: "El precio debe ser un número.",
    })
    .positive({ message: "El precio debe ser un número positivo." }),
  stock: z.coerce
    .number({
      required_error: "El stock es requerido.",
      invalid_type_error: "El stock debe ser un número.",
    })
    .int("El stock debe ser un número entero.")
    .min(0, "El stock no puede ser un número negativo."),
  descuento: z.coerce
    .number({
      required_error: "El descuento es requerido.",
      invalid_type_error: "El descuento debe ser un número.",
    })
    .min(0, "El descuento no puede ser negativo.")
    .max(100, "El descuento no puede ser mayor a 100."),
  disponible: z.boolean().default(true),
  aplicarDescuentoCategoria: z.boolean().default(true),
  categoriaId: z.coerce
    .number({ required_error: "La categoría es requerida." })
    .min(1, "La categoría es requerida."),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) throw new Error("Product ID is required");
      return productService.getProductById(Number(id));
    },
    enabled: !!id,
  });

  // Fetch categories for the select dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio: 0,
      stock: 0,
      descuento: 0,
      disponible: true,
      aplicarDescuentoCategoria: true,
      categoriaId: undefined,
    },
  });

  // Watch descuento field to update aplicarDescuentoCategoria
  const descuento = useWatch({
    control: form.control,
    name: "descuento",
  });

  useEffect(() => {
    if (descuento > 0) {
      form.setValue("aplicarDescuentoCategoria", false);
    }
  }, [descuento, form]);

  useEffect(() => {
    if (product) {
      form.reset({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        stock: product.stock,
        descuento: product.descuento,
        disponible: product.disponible,
        aplicarDescuentoCategoria: product.aplicarDescuentoCategoria,
        categoriaId: product.categoria?.id,
      });
      if (product.image) {
        setImagePreview(
          `${import.meta.env.VITE_API_URL}imagenes/${product.image}`
        );
      }
    }
  }, [product, form]);

  useEffect(() => {
    if (isError) {
      console.error("Error al cargar el producto:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del producto.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ProductFormValues) => {
    const {
      formState: { dirtyFields },
    } = form;

    try {
      if (Object.keys(dirtyFields).length === 0 && !imageFile) {
        toast({
          title: "Sin cambios",
          description: "No se ha modificado ningún campo.",
        });
        return;
      }

      const formData = new FormData();
      if (dirtyFields.nombre) formData.append("nombre", values.nombre);
      if (dirtyFields.descripcion)
        formData.append("descripcion", values.descripcion);
      if (dirtyFields.precio)
        formData.append("precio", values.precio.toString());
      if (dirtyFields.stock)
        formData.append("stock", values.stock.toString());
      if (dirtyFields.descuento)
        formData.append("descuento", values.descuento.toString());
      if (dirtyFields.disponible)
        formData.append("disponible", values.disponible.toString());
      if (dirtyFields.descuento && values.descuento > 0)
        formData.append(
          "aplicarDescuentoCategoria",
          ''
        );
      if (dirtyFields.descuento && values.descuento == 0)
        formData.append(
          "aplicarDescuentoCategoria",
          values.aplicarDescuentoCategoria.toString()
        );
      if (dirtyFields.categoriaId)
        formData.append("categoriaId", values.categoriaId.toString());
      if (imageFile) formData.append("image", imageFile);

      await productServiceExtensions.updateProduct(Number(id), formData);
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente",
      });
      refetch();
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar producto:", (error as Error)?.message);
      const oraciones = (error as Error)?.message.split('.').filter(oracion => oracion.trim().length > 0);
      
      toast({
        title: "Error",
        description: oraciones.map(oracion => {
          return <p key={oracion}>● {oracion.trim()}<br/></p>;
        }),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando detalles del producto...</div>;
  }

  if (isError || !product) {
    return <div className="text-red-500 text-center">Error al cargar los detalles del producto.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Detalles del Producto</h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                  setImageFile(null);
                  if (product.image) {
                    setImagePreview(
                      `${import.meta.env.VITE_API_URL}imagenes/${product.image}`
                    );
                  }
                }}
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Editar Producto
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Vista General</TabsTrigger>
              <TabsTrigger value="edit" onClick={() => setIsEditing(true)}>
                Editar Información
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="view">
              <Card>
                <CardContent className="p-6 grid gap-8 md:grid-cols-3">
                  <div className="md:col-span-1 flex flex-col items-center">
                    {product.image ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}imagenes/${product.image}`}
                        alt={product.nombre}
                        className="w-full max-w-sm h-auto object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <Badge variant="outline">{product.categoria?.nombre || 'Sin Categoría'}</Badge>
                      <h2 className="text-2xl font-semibold mt-2">{product.nombre}</h2>
                      <p className="text-sm text-muted-foreground">Código: {product.codigo}</p>
                    </div>
                    
                    <p className="text-muted-foreground">{product.descripcion}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Precio</p>
                          <p className="font-semibold text-lg">${product.precio?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Package className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Stock</p>
                          <p className="font-semibold text-lg">{product.stock} unidades</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Percent className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Descuento</p>
                          <p className="font-semibold text-lg">{product.descuento}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Disponibilidad</p>
                        {product.disponible ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Disponible</Badge>
                        ) : (
                          <Badge variant="destructive">No Disponible</Badge>
                        )}
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
                    <CardTitle>Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del producto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descripción del producto"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="precio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuración</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="categoriaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                            disabled={categoriesLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category: any) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                field.onChange(value);
                                if (value > 0) {
                                  form.setValue("aplicarDescuentoCategoria", false);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="disponible"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2">
                          <FormLabel>Disponible</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aplicarDescuentoCategoria"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel>Aplicar descuento de categoría</FormLabel>
                            <FormDescription>
                              {form.watch("descuento") > 0 
                                ? "Desactivado porque el producto tiene descuento"
                                : "Aplica el descuento definido en la categoría"}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                if (form.watch("descuento") > 0) {
                                  field.onChange(null);
                                } else {
                                  field.onChange(checked);
                                }
                              }}
                              disabled={form.watch("descuento") > 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Imagen</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mb-2"
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <p className="text-sm mb-1">Vista previa:</p>
                          <img
                            src={imagePreview}
                            alt="Vista previa"
                            className="w-40 h-40 object-cover border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}