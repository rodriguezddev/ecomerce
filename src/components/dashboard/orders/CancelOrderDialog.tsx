import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { CancelOrderData } from "./types";

interface CancelOrderDialogProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (data: CancelOrderData) => void;
  isSubmitting: boolean;
}

export default function CancelOrderDialog({
  show,
  onClose,
  onConfirm,
  isSubmitting
}: CancelOrderDialogProps) {
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [devolverStock, setDevolverStock] = useState(true);

  const handleConfirm = () => {
    onConfirm({
      motivoCancelacion,
      devolverStock
    });
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar Pedido</DialogTitle>
          <DialogDescription>
            ¿Está seguro de que desea cancelar este pedido? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">

          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="devolver-stock"
              checked={devolverStock}
              onCheckedChange={(checked) => setDevolverStock(checked === true)}
            />
            <Label htmlFor="devolver-stock" className="cursor-pointer">
              Devolver productos al stock
            </Label>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Volver
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelando..." : "Confirmar Cancelación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}