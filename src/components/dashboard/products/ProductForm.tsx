import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/api";
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
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
    .int("El stock debe ser anúmero entero.")
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

const extendedValidation = (imageFile: File | null) =>
  productSchema.superRefine((data, ctx) => {
    if (!imageFile) {
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
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(extendedValidation(imageFile)),
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
    try {
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
      toast({
        title: "Producto creado",
        description: "El producto se ha creado correctamente",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard/productos");
      }
    } catch (error) {
      console.error("Error al crear producto:", (error as Error)?.message);
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
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/productos")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Producto
          </Button>
        </div>
      </form>
    </Form>
  );
}