
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categoryService } from "@/services/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { categoryServiceExtensions } from "@/services/api-dashboard";

const categorySchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").regex(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/, "El nombre solo puede contener letras y espacios"),
  descuento: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "El descuento debe ser mayor o igual a 0").max(100, "El descuento no puede ser mayor a 100%")
  ),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: {
    id: number;
    nombre: string;
    descuento: number;
  };
  onSuccess?: () => void;
}

export default function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const { toast } = useToast();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      descuento: initialData?.descuento || 0,
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const { formState: { dirtyFields } } = form;

    try {
      if (initialData) {
        const dataToUpdate: Partial<CategoryFormValues> = {};
        if (dirtyFields.nombre) dataToUpdate.nombre = values.nombre;
        if (dirtyFields.descuento) dataToUpdate.descuento = values.descuento;

        if (Object.keys(dataToUpdate).length > 0) {
          await categoryServiceExtensions.updateCategory(initialData.id, dataToUpdate);
        } else {
          toast({ title: "Sin cambios", description: "No se ha modificado ningún campo." });
          return;
        }
      } else {
        await categoryServiceExtensions.createCategory(values);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al guardar usuario:", (error as Error)?.message);
      const oraciones = (error as Error)?.message.split('.').filter(oracion => oracion.trim().length > 0);
      console.log(oraciones, "oraciones");
      // Aquí es donde capturamos el error lanzado por el servicio y lo mostramos.
      

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
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
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

        <div className="flex justify-end">
          <Button type="submit">
            {initialData ? "Actualizar Categoría" : "Crear Categoría"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
