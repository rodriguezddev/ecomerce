import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUp } from "lucide-react";
import { PaymentMethod } from "./types";

interface PaymentSectionProps {
  showPaymentSection: boolean;
  setShowPaymentSection: (show: boolean) => void;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;
  referenceNumber: string;
  setReferenceNumber: (ref: string) => void;
  voucher: File | null;
  setVoucher: (file: File | null) => void;
  voucherPreview: string | null;
  setVoucherPreview: (preview: string | null) => void;
  isOrderCreated: boolean;
}

export default function PaymentSection({
  showPaymentSection,
  setShowPaymentSection,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  referenceNumber,
  setReferenceNumber,
  voucher,
  setVoucher,
  voucherPreview,
  setVoucherPreview,
  isOrderCreated
}: PaymentSectionProps) {
  
  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVoucher(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Registrar Pago</h3>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowPaymentSection(!showPaymentSection)}
          disabled={isOrderCreated}
        >
          {showPaymentSection ? "Ocultar" : "Mostrar"}
        </Button>
      </div>

      {showPaymentSection && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <RadioGroup
              value={selectedPaymentMethod?.id?.toString() || ""}
              onValueChange={(value) => {
                const method = paymentMethods.find((m: PaymentMethod) => m.id.toString() === value);
                setSelectedPaymentMethod(method || null);
              }}
              className="grid grid-cols-1 gap-4"
              disabled={isOrderCreated}
            >
              {paymentMethods.map((method: PaymentMethod) => (
                <div key={method.id} className="flex items-center space-x-2 bg-white border rounded-lg p-4">
                  <RadioGroupItem 
                    value={method.id.toString()} 
                    id={`method-${method.id}`}
                    disabled={isOrderCreated}
                  />
                  <Label htmlFor={`method-${method.id}`} className="cursor-pointer flex-1">
                    <div className="font-medium">{method.tipo}</div>
                    <div className="text-sm text-gray-600">
                      {method.email && `Email: ${method.email}`}
                      {method.numeroTelefono && `Teléfono: ${method.numeroTelefono}`}{method.numeroTelefono && ' | '}
                      {method.numeroDeCuenta && `Cuenta: ${method.numeroDeCuenta}`}{method.numeroDeCuenta && ' | '}
                      {method.banco && `Banco: ${method.banco}`}{method.banco && ' | '}
                      {method.cedula && `Cedula: ${method.cedula}`}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedPaymentMethod && (
            <div className="space-y-4">
              {["TRANSFERENCIA", "PAGOMOVIL", "ZELLE"].includes(
                selectedPaymentMethod.tipo.toUpperCase()
              ) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Número de Referencia</Label>
                    <Input
                      id="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Ingrese número de referencia"
                      disabled={isOrderCreated}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileUp size={18} />
                      Comprobante de Pago (Opcional)
                    </Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleVoucherChange}
                      disabled={isOrderCreated}
                    />
                    {voucherPreview && (
                      <div className="mt-2">
                        <img
                          src={voucherPreview}
                          alt="Comprobante"
                          className="max-h-40 border rounded"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
              {selectedPaymentMethod.tipo.toLowerCase() === "efectivo" && (
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  <p>Pago en efectivo registrado manualmente.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}