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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderFormValues, Product } from "./types";

interface ProductSelectorProps {
  form: UseFormReturn<OrderFormValues>;
  isEditing: boolean;
  isOrderCreated: boolean;
  products: Product[];
  selectedProducts: any[];
  addProduct: () => void;
  removeProduct: (index: number) => void;
  handleProductSelection: (productId: number, index: number) => void;
  handleQuantityChange: (quantity: number, index: number) => Promise<boolean>;
}

export default function ProductSelector({ 
  form, 
  isEditing, 
  isOrderCreated,
  products,
  selectedProducts,
  addProduct,
  removeProduct,
  handleProductSelection,
  handleQuantityChange
}: ProductSelectorProps) {
  console.log(selectedProducts)
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Registrar Producto</h3>
      
      {form.getValues("items")?.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name={`items.${index}.productoId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const numValue = Number(value);
                      field.onChange(numValue);
                      handleProductSelection(numValue, index);
                    }} 
                    value={field.value.toString()}
                    disabled={isOrderCreated}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
  product.stock > 0 && (
    <SelectItem key={product.id} value={product.id.toString()}>
      {product.nombre} - $
      {(() => {
        let finalPrice = product.precio;
        
        if (product.descuento) {
          finalPrice = product.precio * (1 - product.descuento / 100);
        } 
        // Validación estricta: solo aplica descuento de categoría si aplicarDescuentoCategoria es explícitamente true
        else if (product.categoria?.descuento && product.aplicarDescuentoCategoria === true) {
          finalPrice = product.precio * (1 - product.categoria.descuento / 100);
        }
        
        return finalPrice.toFixed(2);
      })()}
    </SelectItem> 
  )
))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name={`items.${index}.cantidad`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      value={selectedProducts[index]?.cantidad || 1}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        handleQuantityChange(value, index);
                      }}
                      disabled={isOrderCreated}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <div className="flex flex-col justify-around">
              <FormLabel>Subtotal</FormLabel>
              <div className="h-10 flex items-center">
  ${(
    (() => {
      const product = selectedProducts[index];
      let precioConDescuento = product.precio;
      
      // Aplicar descuento directo del producto
      if (product.descuento) {
        precioConDescuento = product.precio - (product.precio * (product.descuento / 100));
      } 
      // Aplicar descuento de categoría solo si aplicarDescuentoCategoria es true
      else if (product.categoria?.descuento && product.aplicarDescuentoCategoria) {
        precioConDescuento = product.precio - (product.precio * (product.categoria.descuento / 100));
      }
      
      return (precioConDescuento * (product?.cantidad || 0));
    })()
  ).toFixed(2)}
</div>
            </div>

            <div className="flex items-end">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => removeProduct(index)}
                disabled={form.getValues("items").length <= 1 || isOrderCreated}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      ))}
<div className="flex justify-end">
<Button 
        type="button" 
        variant="outline" 
        onClick={addProduct}
        disabled={isOrderCreated}
      >
        Agregar Producto
      </Button>
</div>
      
    </div>
  );
}