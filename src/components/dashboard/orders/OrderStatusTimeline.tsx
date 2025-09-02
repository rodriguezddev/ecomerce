import { Card, CardContent } from "@/components/ui/card";
import { Check, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderStatusTimelineProps {
  currentStatus: string;
  allStatuses: string[];
  onStatusChange?: (newStatus: string) => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export default function OrderStatusTimeline({ 
  currentStatus, 
  allStatuses, 
  onStatusChange,
  isEditing = false,
  isSubmitting = false
}: OrderStatusTimelineProps) {
  const currentIndex = allStatuses.indexOf(currentStatus);
  
  const handleStatusClick = (status: string, index: number) => {
    if (!isEditing || index <= currentIndex || !onStatusChange) return;
    onStatusChange(status);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4">Progreso del Pedido</h3>
        <div className="space-y-4">
          {allStatuses.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isSelectable = isEditing && index > currentIndex && index <= currentIndex + 1;
            
            return (
              <div key={status} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  {index < allStatuses.length - 1 && (
                    <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`${isCurrent ? 'font-medium' : 'text-muted-foreground'} mb-1`}>
                    {status}
                    {isCurrent && <span className="ml-2 text-sm text-blue-500">(Actual)</span>}
                  </div>
                  
                  {isSelectable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusClick(status, index)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      Avanzar a este estado
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}