import { useRef, useState } from "react";
import { reportService } from "@/services/api-extensions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  AlignEndVertical,
  BarChart4,
  FileDown,
  FileText,
  PackageCheck,
  PackageMinus,
  ShoppingBag,
  Tag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import ReporteVentasDiarias from "./ReporteVentasDiarias";
import ReporteVentasCategoria from "./ReporteVentasCategoria";
import ReporteProductosSinStock from "./ReporteProductosSinStock";
import ReporteProductosMasVendidos from "./ReporteProductosMasVendidos";
import ReporteProductosMenosVendidos from "./ReporteProductosMenosVendidos";
import ReporteInventario from "./ReporteInventario";

export default function ReportsPanel() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(),
    new Date(),
  ]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownloadReport = async (reportType: string) => {
    try {
      setIsLoading(true);
      
      // Validar que ambas fechas estén seleccionadas para reportes que lo requieran
      if ((reportType === 'sales' || reportType === 'categorySales') && (!startDate || !endDate)) {
        toast({
          title: "Error",
          description: "Debes seleccionar un rango de fechas válido",
          variant: "destructive",
        });
        return;
      }

      // Preparar el objeto dateRange para los reportes
      const formattedDateRange = {
        fromDay: startDate?.getDate() || new Date().getDate(),
        fromMonth: startDate ? startDate.getMonth() : new Date().getMonth(),
        fromYear: startDate?.getFullYear() || new Date().getFullYear(),
        
        untilDay: endDate?.getDate()  || new Date().getDate(),
        untilMonth: endDate ? endDate.getMonth() : new Date().getMonth(),
        untilYear: endDate?.getFullYear() || new Date().getFullYear()
      };
      
      let fileBlob;
      
      switch (reportType) {
        case 'sales':
          fileBlob = await reportService.getSalesReport(formattedDateRange);
          break;
        case 'categorySales':
          fileBlob = await reportService.getCategorySalesReport(formattedDateRange);
          break;
        case 'zeroStock':
          fileBlob = await reportService.getZeroStockReport();
          break;
        case 'topSelling':
          fileBlob = await reportService.getTopSellingReport();
          break;
        case 'leastSelling':
          fileBlob = await reportService.getLeastSellingReport();
          break;
        case 'inventory':
          fileBlob = await reportService.getInventoryReport();
          break;
        default:
          toast({
            title: "Error",
            description: "Tipo de reporte no reconocido",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
      }
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Reporte descargado",
        description: "El reporte ha sido descargado correctamente",
      });
    } catch (error) {
      console.error("Error al descargar reporte:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Añade esta función para manejar la impresión
  const pdfRef = useRef<HTMLDivElement>(null);
  const pdfRefCat = useRef<HTMLDivElement>(null);
  const pdfRefZeroStock = useRef<HTMLDivElement>(null);
  const pdfRefTopSelling = useRef<HTMLDivElement>(null);
  const pdfRefLeastSelling = useRef<HTMLDivElement>(null);
  const pdfRefInventory = useRef<HTMLDivElement>(null);

  const handlePrintInventory = useReactToPrint({
    contentRef: pdfRefInventory,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        font-family: Arial, sans-serif; 
      }
    `
  });

  const handlePrintLeastSelling = useReactToPrint({
    contentRef: pdfRefLeastSelling,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        font-family: Arial, sans-serif; 
      }
    `
  });

  const handlePrintTopSelling = useReactToPrint({
    contentRef: pdfRefTopSelling,
    pageStyle: `
      @page {
        size: A4; 
        margin: 10mm;
      }
      body {  
        font-family: Arial, sans-serif;
      }
    `
  });

  const handlePrintZeroStock = useReactToPrint({
    contentRef: pdfRefZeroStock,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        font-family: Arial, sans-serif;
      }
    `
  });
  
  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        font-family: Arial, sans-serif;
      }
    `
  });

    const handlePrintcat = useReactToPrint({
    contentRef: pdfRefCat,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        font-family: Arial, sans-serif;
      }
    `
  });


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
        <p className="text-muted-foreground">
          Genera y descarga reportes del sistema
        </p>
      </div>
      
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">
            <FileText className="mr-2 h-4 w-4" />
            Ventas
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <PackageCheck className="mr-2 h-4 w-4" />
            Inventario
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
           
            <CardHeader>
              <CardTitle>Filtro de Fechas</CardTitle>
              <CardDescription>Selecciona el rango de fechas para los reportes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Rango de fechas:</label>
                <div className=" grid grid-cols-3 gap-2">
                  <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  isClearable={true}
                  placeholderText="Selecciona un rango de fechas"
                  className="border rounded-md p-2 w-full"
                  dateFormat="dd/MM/yyyy"
                  locale="es"
                  //maxDate={new Date()}
                />
                </div>  
                
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card style={{ minHeight: '13rem' }} className="display flex flex-col justify-between">
               <div ref={pdfRef} className="hidden print:block">
                      <ReporteVentasDiarias  
                          periodoInicial={startDate}
                          periodoFinal={endDate}
                      />
                    </div>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Reporte de Ventas
                </CardTitle>
                <CardDescription className="pt-3">
                  Descargar informe detallado de todas las ventas en el período seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={handlePrint}
                  disabled={isLoading || !startDate || !endDate}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Descargar Reporte
                </Button>
              </CardContent>
            </Card>
            
            <Card style={{ minHeight: '13rem' }} className="display flex flex-col justify-between">
               <div ref={pdfRefCat} className="hidden print:block">
                      <ReporteVentasCategoria  
                          periodoInicial={startDate}
                          periodoFinal={endDate}
                      />
                    </div>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Reporte de Ventas por Categorías
                </CardTitle>
                <CardDescription className="pt-3">
                  Descargar informe de ventas agrupado por categorías de productos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={handlePrintcat}
                  disabled={isLoading || !startDate || !endDate}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Descargar Reporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card style={{ minHeight: '10rem' }} className="display flex flex-col justify-between">
  <div ref={pdfRefZeroStock} className="hidden print:block">
    <ReporteProductosSinStock
      empresa="Repuestos y Accesorios M&C&, C.A"
      año={new Date().getFullYear().toString()}
    />
  </div>
  <CardHeader>
    <CardTitle className="flex items-center">
      <PackageMinus className="mr-2 h-5 w-5" />
      Productos Sin Stock
    </CardTitle>
    <CardDescription className="pt-3">
      Informe de productos con existencia cero
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button 
      className="w-full" 
      onClick={handlePrintZeroStock}
      disabled={isLoading}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Descargar Reporte
    </Button>
  </CardContent>
</Card>
          
          <Card style={{ minHeight: '10rem' }} className="display flex flex-col justify-between">
  <div ref={pdfRefTopSelling} className="hidden print:block">
    <ReporteProductosMasVendidos
      empresa="Repuestos y Accesorios M&C&, C.A"
      año={new Date().getFullYear().toString()}
    />
  </div>
  <CardHeader>
    <CardTitle className="flex items-center">
      <BarChart4 className="mr-2 h-5 w-5" />
      Productos Más Vendidos
    </CardTitle>
    <CardDescription className="pt-3">
      Ranking de los productos con mayores ventas
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button 
      className="w-full" 
      onClick={handlePrintTopSelling}
      disabled={isLoading}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Descargar Reporte
    </Button>
  </CardContent>
</Card>
          
          <Card style={{ minHeight: '10rem' }} className="display flex flex-col justify-between">
  <div ref={pdfRefLeastSelling} className="hidden  print:block">
    <ReporteProductosMenosVendidos
      empresa="Repuestos y Accesorios M&C&, C.A"
      año={new Date().getFullYear().toString()}
    />
  </div>
  <CardHeader>
    <CardTitle className="flex items-center">
      <BarChart4 className="mr-2 h-5 w-5 rotate-180" />
      Productos Menos Vendidos
    </CardTitle>
    <CardDescription className="pt-3">
      Ranking de los productos con menos ventas
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button 
      className="w-full" 
      onClick={handlePrintLeastSelling}
      disabled={isLoading}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Descargar Reporte
    </Button>
  </CardContent>
</Card>

          <Card style={{ minHeight: '10rem' }} className="display flex flex-col justify-between">
  <div ref={pdfRefInventory} className="hidden print:block">
    <ReporteInventario
      empresa="Repuestos y Accesorios M&C&, C.A"
      año={new Date().getFullYear().toString()}
    />
  </div>
  <CardHeader>
    <CardTitle className="flex items-center">
      <AlignEndVertical className="mr-2 h-5 w-5 rotate-180" />
      Inventario Actual
    </CardTitle>
    <CardDescription className="pt-3">
      Informe detallado del inventario actual de productos
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button 
      className="w-full" 
      onClick={handlePrintInventory}
      disabled={isLoading}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Descargar Reporte
    </Button>
  </CardContent>
</Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}