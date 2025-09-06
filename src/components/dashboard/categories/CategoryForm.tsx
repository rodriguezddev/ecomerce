import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { categoryServiceExtensions } from "@/services/api-dashboard";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const categorySchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").regex(/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/, "El nombre solo puede contener letras y espacios"),
  descuento: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "El descuento debe ser mayor o igual a 0").max(100, "El descuento no puede ser mayor a 100%")
  ),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoryForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: "",
      descuento: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: categoryServiceExtensions.createCategory,
    onSuccess: () => {
      toast({
        title: "Categoría creada",
        description: "La categoría se ha creado correctamente",
      });
      navigate("/dashboard/categorias");
    },
    onError: (error) => {
      const errorMessages = (error as Error)?.message
        .split('.')
        .filter((msg) => msg.trim().length > 0);
      toast({
        title: "Error",
        description: (
          <div>
            {errorMessages.map((msg, index) => (
              <p key={index}>● {msg.trim()}</p>
            ))}
          </div>
        ),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/categorias")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Crear Nueva Categoría</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Categoría</CardTitle>
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
                  <h4 className="font-medium mb-2">Sobre las categorías</h4>
                  <p className="text-sm text-muted-foreground">
                    Las categorías te permiten organizar tus productos y aplicar descuentos
                    automáticamente a grupos de productos relacionados.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-2 text-blue-800">Recomendaciones</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Usa nombres descriptivos y claros</li>
                    <li>• El descuento aplica a todos los productos de la categoría</li>
                    <li>• Los productos pueden tener descuentos individuales</li>
                    <li>• Puedes modificar la categoría en cualquier momento</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="cancel"
              onClick={() => navigate("/dashboard/categorias")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" /> Crear Categoría
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}