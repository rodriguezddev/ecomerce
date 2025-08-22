import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { categoryService, productService, Product } from "@/services/api";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { productServiceExtensions } from "@/services/api-dashboard";

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

const extendedValidation = (isEditMode: boolean, imageFile: File | null) =>
  productSchema.superRefine((data, ctx) => {
    if (!isEditMode && !imageFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La imagen es requerida",
        path: ["image"],
      });
    }
  });

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: Product;
}

export default function ProductForm({
  onSuccess,
  initialData,
}: ProductFormProps) {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(extendedValidation(!!id, imageFile)),
    defaultValues: {
      nombre: initialData?.nombre || "",
      descripcion: initialData?.descripcion || "",
      precio: initialData?.precio || 0,
      stock: initialData?.stock || 0,
      descuento: initialData?.descuento || 0,
      disponible: initialData?.disponible ?? true,
      aplicarDescuentoCategoria: initialData?.aplicarDescuentoCategoria ?? true,
      categoriaId: initialData?.categoria?.id || undefined,
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

  // Fetch product data if in edit mode
  useEffect(() => {
    if (id && !initialData) {
      const fetchProduct = async () => {
        try {
          const product = await productService.getProductById(Number(id));
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
        } catch (error) {
          console.error("Error al cargar producto:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar la información del producto",
            variant: "destructive",
          });
        }
      };

      fetchProduct();
    } else if (initialData) {
      form.reset({
        nombre: initialData.nombre,
        descripcion: initialData.descripcion,
        precio: initialData.precio,
        stock: initialData.stock,
        descuento: initialData.descuento,
        disponible: initialData.disponible,
        aplicarDescuentoCategoria: initialData.aplicarDescuentoCategoria,
        categoriaId: initialData.categoria?.id,
      });
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
    }
  }, [id, initialData, form]);

  // Fetch categories for the select dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

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

    // Forzar revalidación del formulario
    form.trigger();
  };

  const onSubmit = async (values: ProductFormValues) => {
    const {
      formState: { dirtyFields },
    } = form;

    try {
      if (id) {
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
            null
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
      } else {
        if (!imageFile) {
          toast({
            title: "Error de validación",
            description: "La imagen del producto es requerida.",
            variant: "destructive",
          });
          return;
        }

        const formData = new FormData();
        formData.append("nombre", values.nombre);
        formData.append("descripcion", values.descripcion);
        formData.append("precio", values.precio.toString());
        formData.append("stock", values.stock.toString());
        formData.append("descuento", values.descuento.toString());
        formData.append("disponible", values.disponible.toString());
          if (values.descuento > 0)
          formData.append(
            "aplicarDescuentoCategoria",
            ''
          );
        if (values.descuento == 0)
          formData.append(
            "aplicarDescuentoCategoria",
            values.aplicarDescuentoCategoria.toString()
          );
        formData.append("categoriaId", values.categoriaId.toString());
        formData.append("image", imageFile);

        await productServiceExtensions.createProduct(formData);
      }

      onSuccess ? onSuccess() : navigate("/dashboard/productos");
    } catch (error) {
      console.error("Error al guardar usuario:", (error as Error)?.message);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {id && (
          <div
            className="p-3 text-sm text-blue-700 bg-blue-100 rounded-lg"
            role="alert"
          >
            <span className="font-medium">Datos de producto ya creados.</span>{" "}
            Estás en modo de edición.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
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
          </div>

          <div className="space-y-6">
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
              {form.formState.errors.image && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.image.message}
                </p>
              )}
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
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {id && (
            <Button
              type="button"
              variant="cancel"
              onClick={() => navigate("/dashboard/productos")}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {id ? "Actualizar Producto" : "Crear Producto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}