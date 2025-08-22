import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Pedido } from "./types";
import { useToast } from "@/hooks/use-toast";

interface OrderSuccessModalProps {
  show: boolean;
  onClose: () => void;
  orderData: Pedido | null;
}

export default function OrderSuccessModal({ show, onClose, orderData }: OrderSuccessModalProps) {
  const { toast } = useToast();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El ID ha sido copiado al portapapeles",
    });
  };

  if (!orderData) return null;

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pedido Creado Exitosamente</DialogTitle>
          <DialogDescription>
            El pedido ha sido registrado en el sistema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Número de Pedido:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">#{orderData.id}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(orderData.id.toString())}
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado:</span>
            <Badge variant={orderData.pagado ? "default" : "secondary"}>
              {orderData.pagado ? "Pagado" : "Pendiente de pago"}
            </Badge>
          </div>

          {orderData.factura && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recibo:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">#{orderData.factura.id}</span>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/dashboard/recibos/${orderData.factura?.id}`}>
                    <Eye size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cerrar
            </Button>
            <Button asChild className="flex-1">
              <Link to={`/dashboard/pedidos/${orderData.id}`}>
                <FileText size={16} className="mr-2" />
                Ver Detalles
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}