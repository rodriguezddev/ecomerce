import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { orderService, invoiceService, paymentService } from "@/services/api-extensions";
import { userService } from "@/services/api-extensions";
import { paymentMethodService } from "@/services/paymentMethodService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Trash2, Undo2 } from "lucide-react";
import { productServiceExtensions } from "@/services/api-dashboard";
import { productService } from "@/services/api";

// Components
import OrderFormFields from "./OrderFormFields";
import PaymentSection from "./PaymentSection";
import OrderSuccessModal from "./OrderSuccessModal";

// Types and utils
import { OrderFormValues, Pedido, PaymentMethod } from "./types";
import { getChangedFields, calculateTotal, validateStock, updateProductStock, mapPaymentMethodToBackend, restoreProductStock } from "../../../utils/utils";
import CancelOrderDialog from "./CancelOrderDialog";

// Nuevo tipo para el estado de cancelación
export interface CancelOrderData {
  motivoCancelacion: string;
  devolverStock: boolean;
}

const orderFormSchema = z.object({
  tipoDePedido: z.string(),
  pagado: z.boolean(),
  estado: z.string(),
  perfilId: z.number().optional().nullable(),
  items: z.array(
    z.object({
      cantidad: z.number().min(1),
      productoId: z.number().positive()
    })
  ).min(1, "Debe agregar al menos un producto")
}).superRefine((data, ctx) => {
  if (data.pagado && data.estado === "Pedido en verificacion de pago") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Un pedido pagado no puede estar en verificación de pago",
      path: ["estado"]
    });
  }
});

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [initialValues, setInitialValues] = useState<OrderFormValues | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [voucher, setVoucher] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<Pedido | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      tipoDePedido: "Tienda",
      pagado: false,
      estado: "Pedido en verificacion de pago",
      perfilId: undefined,
      items: []
    }
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "pagado" && value.pagado) {
        form.setValue("estado", "Pedido en proceso de empaquetado");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Fetch order if editing
  const { data: order, isLoading: orderLoading } = useQuery<Pedido>({
    queryKey: ["order", id],
    queryFn: async () => {
      if (id) {
        const orderData = await orderService.getOrderById(Number(id));
        if (!orderData.factura) {
          try {
            const invoice = await invoiceService.getInvoiceByOrderId(Number(id));
            return { ...orderData, factura: invoice };
          } catch (error) {
            return orderData;
          }
        }
        return orderData;
      }
      return null;
    },
    enabled: isEditing,
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await productService.getProducts();
      return response || [];
    }
  });

  // Fetch profiles (clientes)
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: paymentMethodService.getPaymentMethods,
  });

  // Initialize form with order data when editing
  useEffect(() => {
    if (isEditing && order) {
      const formattedItems = order.items?.map((item) => ({
        cantidad: item.cantidad,
        productoId: item.producto.id,
        descuento: item.producto.descuento || 0
      }));

      const selectedProductsData = order.items?.map((item) => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad,
        descuento: item.producto.descuento || 0
      }));

      const initialData = {
        tipoDePedido: order.tipoDePedido,
        pagado: order.pagado,
        estado: order.estado,
        perfilId: order.perfil?.id ?? null,
        items: formattedItems
      };

      form.reset(initialData);
      setInitialValues(initialData);
      setSelectedProducts(selectedProductsData || []);

      if (order.pago) {
        setSelectedPaymentMethod({
          id: order.pago.metodoDePago.id,
          tipo: order.pago.metodoDePago.tipo,
          ...order.pago.metodoDePago
        });
        setReferenceNumber(order.pago.numeroReferencia || "");
      }
    }
  }, [order, isEditing, form]);

  const addProduct = () => {
    const items = form.getValues("items");
    form.setValue("items", [...items, { cantidad: 1, productoId: products[0]?.id || 0 }]);
    setSelectedProducts([...selectedProducts, {
      id: products[0]?.id || 0,
      nombre: products[0]?.nombre || "",
      precio: products[0]?.precio || 0,
      descuento: products[0]?.descuento || 0,
      cantidad: 1
    }]);
  };

  const removeProduct = async (index: number) => {
    const items = form.getValues("items");
    const newItems = [...items];
    const removedItem = newItems.splice(index, 1);
    form.setValue("items", newItems);
    
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts.splice(index, 1);
    setSelectedProducts(newSelectedProducts);

    // Si estamos editando, devolver el stock del producto eliminado
    if (isEditing && initialValues) {
      try {
        const formData = new FormData();
        const originalItem = initialValues.items[index];
        if (originalItem) {
          const product = await productService.getProductById(originalItem.productoId);
          const newStock = product.stock + originalItem.cantidad;
          
          formData.append("stock", newStock.toString());
          await productServiceExtensions.updateProduct(Number(originalItem.productoId), formData);
        }
      } catch (error) {
        console.error("Error al devolver el stock:", error);
        toast({
          title: "Error",
          description: "No se pudo devolver el stock del producto eliminado",
          variant: "destructive",
        });
      }
    }
  };

  const handleProductSelection = (productId: number, index: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const newSelectedProducts = [...selectedProducts];
      newSelectedProducts[index] = {
        ...newSelectedProducts[index],
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        descuento: product?.descuento || 0,
      };
      setSelectedProducts(newSelectedProducts);
    }
  };

  const handleQuantityChange = async (quantity: number, index: number) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts[index] = {
      ...newSelectedProducts[index],
      cantidad: quantity
    };
    setSelectedProducts(newSelectedProducts);

    // Si estamos editando, validar el stock
    if (isEditing && initialValues) {
      const productId = newSelectedProducts[index].id;
      const originalQuantity = initialValues.items[index]?.cantidad || 0;
      const quantityDifference = quantity - originalQuantity;

      console.log(quantity, originalQuantity)

      if (quantityDifference > 0) { // Solo validamos si estamos aumentando la cantidad
        try {
          const product = await productService.getProductById(productId);
          if (product.stock < quantityDifference) {
            toast({
              title: "Stock insuficiente",
              description: `No hay suficiente stock para ${product.nombre} (Disponible: ${product.stock})`,
              variant: "destructive",
            });
            // Revertir el cambio
            newSelectedProducts[index] = {
              ...newSelectedProducts[index],
              cantidad: originalQuantity
            };
            setSelectedProducts(newSelectedProducts);
            return false;
          }
        } catch (error) {
          console.error("Error al verificar el stock:", error);
        }
      }
    }
    return true;
  };

  const createInvoice = async (orderId: number) => {
    try {
      try {
        const existingInvoice = await invoiceService.getInvoiceByOrderId(orderId);
        if (existingInvoice) {
          return existingInvoice;
        }
      } catch (error) {}

      const invoiceData = {
        pedidoId: orderId,
        descripcion: `Recibo para pedido #${orderId}`,
      };
      
      const invoice = await invoiceService.createInvoice(invoiceData);
      return invoice;
    } catch (error) {
      console.error("Error al crear recibo:", error);
      throw error;
    }
  };

  const processPayment = async (orderId: number, orderValues: OrderFormValues, paymentMethod: PaymentMethod) => {
    try {
      const total = calculateTotal(selectedProducts);

      const paymentData = {
        nombreFormaDePago: mapPaymentMethodToBackend(paymentMethod.tipo),
        monto: total,
        metodoDePagoId: paymentMethod.id,
        ...(paymentMethod.tipo.toLowerCase() !== "efectivo" && { 
          numeroReferencia: referenceNumber.trim() 
        })
      };

      const payment = await paymentService.createPayment(orderId, paymentData);

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado correctamente",
      });

      return payment;
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast({
        title: "Error en el pago",
        description: "El pedido se guardó pero hubo un error al registrar el pago",
        variant: "destructive",
      });
      throw error;
    }
  };

  const onSubmit = async (values: OrderFormValues) => {
    // Validación adicional manual
    if (values.pagado && values.estado === "Pedido en verificacion de pago") {
      toast({
        title: "Error",
        description: "Un pedido pagado no puede estar en verificación de pago",
        variant: "destructive",
      });
      return;
    }

    // Validar stock antes de crear o editar el pedido
    const stockValidation = await validateStock(
      values.items, 
      initialValues?.items || [], 
      isEditing
    );
    
    if (!stockValidation.valid) {
      toast({
        title: "Error de stock",
        description: stockValidation.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isEditing && !selectedPaymentMethod) {
        toast({
          title: "Método de pago requerido",
          description: "Debe seleccionar un método de pago para crear un nuevo pedido",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (isEditing) {
        // En modo edición, solo actualizamos los campos de estado y pago
        const changes = {
          pagado: values.pagado,
          estado: values.estado
        };
        
        if (values.pagado === initialValues?.pagado && values.estado === initialValues?.estado) {
          toast({
            title: "Sin cambios",
            description: "No se detectaron cambios para actualizar",
            variant: "default",
          });
          setIsSubmitting(false);
          return;
        }

        const updatedOrder = await orderService.updateOrder(Number(id), changes);
        
        if (selectedPaymentMethod) {
          await processPayment(Number(id), values, selectedPaymentMethod);
        }
        
        if (!order?.factura && values.pagado) {
          try {
            await createInvoice(updatedOrder.id);
            toast({
              title: "Factura creada",
              description: "Se ha generado una nueva factura para este pedido",
            });
          } catch (error) {
            console.error("Error al crear factura:", error);
            toast({
              title: "Pedido actualizado",
              description: "El pedido se actualizó pero hubo un error al crear la factura",
              variant: "default",
            });
          }
        }
        
        toast({
          title: "Pedido actualizado",
          description: "El pedido ha sido actualizado correctamente",
        });
        navigate("/dashboard/pedidos");
      } else {
        const createdOrder = await orderService.createOrder(values);

        // Actualizar el stock de los productos
        const stockUpdated = await updateProductStock(values.items, [], isEditing);
        if (!stockUpdated) {
          toast({
            title: "Pedido creado",
            description: "El pedido se creó pero hubo un error al actualizar el stock de los productos",
            variant: "default",
          });
        }

        if (selectedPaymentMethod) {
          await processPayment(createdOrder.id, values, selectedPaymentMethod);
        }
        
        let invoice = null;
        if (values.pagado) {
          invoice = await createInvoice(createdOrder.id);
        }

        const completeOrderData = await orderService.getOrderById(createdOrder.id);
        
        setCreatedOrderData({
          ...completeOrderData,
          factura: invoice || undefined
        });
        setShowSuccessModal(true);

        toast({
          title: "Pedido creado",
          description: values.pagado 
            ? "El pedido y su recibo han sido creados correctamente" 
            : "El pedido ha sido creado (pendiente de pago)",
        });
      }
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
      toast({
        title: "Error",
        description: (error as any)?.message || "No se pudo guardar el pedido.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (cancelData: CancelOrderData) => {
    if (!isEditing || !order) return;
    
    setIsSubmitting(true);
    try {
      console.log("Cancelando pedido:", order.id);
      console.log("Items del pedido:", order.items);
      
      // 1. Actualizar el estado del pedido a "cancelado"
      const updatedOrder = await orderService.updateOrder(Number(id), {
        estado: "Cancelado",
      });
      
      console.log("Pedido actualizado:", updatedOrder);
      
      // 2. Devolver el stock si está seleccionado
      if (cancelData.devolverStock) {
        console.log("Devolviendo stock...");
        
        // Transformar la estructura
        const itemsForStockRestoration = order.items.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad
        }));
        
        console.log("Items para restaurar stock:", itemsForStockRestoration);
        
        const stockRestored = await restoreProductStock(itemsForStockRestoration);
        
        console.log("Resultado de restaurar stock:", stockRestored);
        
        if (!stockRestored) {
          toast({
            title: "Pedido cancelado",
            description: "El pedido fue cancelado pero hubo un error al devolver el stock",
            variant: "default",
          });
        } else {
          toast({
            title: "Pedido cancelado",
            description: "El pedido fue cancelado y el stock fue devuelto correctamente",
          });
        }
      } else {
        toast({
          title: "Pedido cancelado",
          description: "El pedido fue cancelado",
        });
      }
      
      // 3. Redirigir a la lista de pedidos
      navigate("/dashboard/pedidos");
    } catch (error) {
      console.error("Error al cancelar el pedido:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar el pedido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowCancelDialog(false);
    }
  };

  if (orderLoading || productsLoading || profilesLoading || isLoadingPaymentMethods) {
    return <div className="flex items-center justify-center h-64">Cargando...</div>;
  }

  const isOrderCreated = isEditing && order;
  const handleredirect = () => { navigate("/dashboard/pedidos"); setShowSuccessModal(false)}

  return (
    <>
      <OrderSuccessModal 
        show={showSuccessModal} 
        onClose={handleredirect} 
        orderData={createdOrderData} 
      />
      
      <CancelOrderDialog
        show={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        isSubmitting={isSubmitting}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center ">
<Button className="mr-2" variant="outline" size="icon" onClick={() => navigate(-1)}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
          <CardTitle>
            {isEditing ? `Actualizar estatus del pedido #${id}` : "Nuevo Pedido"}
          </CardTitle>
          </div>
          
          {isEditing && order && order.estado === "Cancelado" && (
            <Button 
              variant="outline" 
              onClick={async () => {
                // Lógica para reactivar pedido cancelado
                setIsSubmitting(true);
                try {
                  await orderService.updateOrder(Number(id), {
                    estado: "Pedido en verificacion de pago"
                  });
                  toast({
                    title: "Pedido reactivado",
                    description: "El pedido ha sido reactivado correctamente",
                  });
                  // Recargar los datos
                  window.location.reload();
                } catch (error) {
                  console.error("Error al reactivar el pedido:", error);
                  toast({
                    title: "Error",
                    description: "No se pudo reactivar el pedido",
                    variant: "destructive",
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Reactivar Pedido
            </Button>
          )}
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {isEditing ? (
                // En modo edición, solo mostramos los campos de estado y pago
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado de pago</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      {...form.register("pagado")}
                    >
                      <option value="false">Pendiente de pago</option>
                      <option value="true">Pagado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado de envío</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      {...form.register("estado")}
                    >
                      <option value="Pedido en verificacion de pago">En verificación de pago</option>
                      <option value="Pedido en proceso de empaquetado">En proceso de empaquetado</option>
                      <option value="Pedido en camino">En camino</option>
                      <option value="Pedido entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              ) : (
                // En modo creación, mostramos todos los campos
                <OrderFormFields 
                  form={form}
                  profiles={profiles || []}
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
              
              {!isEditing && (
                <PaymentSection
                  showPaymentSection={showPaymentSection}
                  setShowPaymentSection={setShowPaymentSection}
                  paymentMethods={paymentMethods}
                  selectedPaymentMethod={selectedPaymentMethod}
                  setSelectedPaymentMethod={setSelectedPaymentMethod}
                  referenceNumber={referenceNumber}
                  setReferenceNumber={setReferenceNumber}
                  voucher={voucher}
                  setVoucher={setVoucher}
                  voucherPreview={voucherPreview}
                  setVoucherPreview={setVoucherPreview}
                  isOrderCreated={isOrderCreated}
                />
              )}

              {!isEditing && (
                <div className="flex justify-end">
                  <div className="text-lg font-medium">
                    Total: ${calculateTotal(selectedProducts).toFixed(2)}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="cancel" type="button" onClick={() => navigate("/dashboard/pedidos")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : isEditing ? "Actualizar Estatus" : "Crear Pedido"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}