import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderFormValues, Product, Profile } from "./types";
import ProductSelector from "./ProductSelector";

interface OrderFormFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  profiles: Profile[];
  isEditing: boolean;
  isOrderCreated: boolean;
  products: Product[];
  selectedProducts: any[];
  addProduct: () => void;
  removeProduct: (index: number) => void;
  handleProductSelection: (productId: number, index: number) => void;
  handleQuantityChange: (quantity: number, index: number) => Promise<boolean>;
}

export default function OrderFormFields({ 
  form, 
  envio,
  profiles, 
  isEditing, 
  isOrderCreated,
  products,
  selectedProducts,
  addProduct,
  removeProduct,
  handleProductSelection,
  handleQuantityChange
}: OrderFormFieldsProps) {

  console.log(envio, "envio en order form fields");

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isEditing && (
        <FormField
          control={form.control}
          name="tipoDePedido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Pedido</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={isOrderCreated}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Tienda">Tienda</SelectItem>
                  <SelectItem value="Online">Web</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        )}

        <FormField
          control={form.control}
          name="pagado"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel>Estado de Pago</FormLabel>
              </div>
              <Select 
                onValueChange={(value) => field.onChange(value === "true")} 
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Pagado</SelectItem>
                  <SelectItem value="false">Pendiente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => {
            const isPaid = form.watch("pagado");
            return (
              <FormItem>
                <FormLabel>Estado del pedido</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={isPaid && field.value === "Pedido en verificacion de pago"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {
                      envio?.metodoDeEntrega !== "Retiro en tienda" && (
                        <>
                        <SelectItem 
                      value="Pedido en verificacion de pago" 
                      disabled={isPaid}
                    >
                      En verificación de pago
                    </SelectItem>
                    <SelectItem value="Pedido en proceso de empaquetado">
                      En proceso de empaquetado
                    </SelectItem>
                    <SelectItem value="Pedido enviado">Enviado</SelectItem>
                        </>
                      )
                    }
                    
                    {
                      envio?.metodoDeEntrega === "Retiro en tienda" && (
<SelectItem value="Disponible para entregar">Disponible para entrega</SelectItem>
                      )
                    }
                    
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        

        <FormField
          control={form.control}
          name="perfilId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const newValue = value === "null" ? null : Number(value);
                  field.onChange(newValue);
                }} 
                value={field.value === null || field.value === undefined ? "null" : field.value.toString()}
                disabled={isOrderCreated}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Sin cliente asignado</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem 
                      key={profile.id} 
                      value={profile.id.toString()}
                    >
                      {profile.perfil?.nombre} {profile.perfil?.apellido} - {profile?.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />
{!isEditing && (
      <ProductSelector 
        form={form}
        isEditing={isEditing}
        isOrderCreated={isOrderCreated}
        products={products}
        selectedProducts={selectedProducts}
        addProduct={addProduct}
        removeProduct={removeProduct}
        handleProductSelection={handleProductSelection}
        handleQuantityChange={handleQuantityChange}
      />
)}
    </>
  );
}