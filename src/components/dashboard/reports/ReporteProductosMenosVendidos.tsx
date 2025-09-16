import React, { useEffect, useState, useMemo } from 'react';
import bgT from '../../../assets/bg-t.png';
import bgB from '../../../assets/bg-b.png';
import logoBlanco from '../../../assets/M&C7_logo_blanco.png';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/api';

interface ProductoMenosVendido {
  producto_id: number;
  producto_nombre: string;
  producto_codigo: string;
  totalProductos: number;
}

interface ReporteProductosMenosVendidosProps {
  empresa?: string;
  año?: string;
}

const ReporteProductosMenosVendidos: React.FC<ReporteProductosMenosVendidosProps> = ({
  empresa = 'Repuestos y Accesorios M&C&, C.A',
  año = new Date().getFullYear().toString()
}) => {
  const [productosMenosVendidos, setProductosMenosVendidos] = useState<ProductoMenosVendido[]>([]);

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await orderService.getOrders();
      return response || [];
    },
  });

  // Procesar datos para obtener los productos menos vendidos
  const procesarProductosMenosVendidos = useMemo(() => {
    // Filtrar órdenes válidas (con factura, pagadas y no canceladas)
    const ordenesValidas = orders.filter((order: any) => 
      order.factura && order.pagado && !order.cancelado
    );

    // Objeto para acumular ventas por producto
    const ventasPorProducto: Record<number, {
      id: number;
      nombre: string;
      codigo: string;
      cantidad: number;
    }> = {};

    // Procesar cada orden válida
    ordenesValidas.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const productoId = item.producto.id;
        const productoNombre = item.producto.nombre;
        const productoCodigo = item.producto.codigo;
        const cantidad = item.cantidad;

        // Si el producto no existe en el objeto, inicializarlo
        if (!ventasPorProducto[productoId]) {
          ventasPorProducto[productoId] = {
            id: productoId,
            nombre: productoNombre,
            codigo: productoCodigo,
            cantidad: 0
          };
        }

        // Sumar la cantidad vendida
        ventasPorProducto[productoId].cantidad += cantidad;
      });
    });

    // Convertir a array, filtrar productos con ventas y ordenar por cantidad ascendente
    const productosArray = Object.values(ventasPorProducto)
      .filter(producto => producto.cantidad > 0) // Solo productos con ventas
      .map(producto => ({
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        producto_codigo: producto.codigo,
        totalProductos: producto.cantidad
      }))
      .sort((a, b) => a.totalProductos - b.totalProductos) // Orden ascendente (menos vendidos primero)
      .slice(0, 10); // Tomar solo los 10 primeros

    return productosArray;
  }, [orders]);

  // Crear una versión estable de los datos procesados para comparación
  const datosProcesadosEstables = useMemo(() => {
    return JSON.stringify(procesarProductosMenosVendidos);
  }, [procesarProductosMenosVendidos]);

  useEffect(() => {
    setProductosMenosVendidos(procesarProductosMenosVendidos);
  }, [datosProcesadosEstables]);

  // Obtener fecha actual formateada
  const obtenerFechaActual = () => {
    const now = new Date();
    return now.toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return <div>Cargando órdenes...</div>;
  }

  if (error) {
    return <div>Error al cargar las órdenes: {(error as Error).message}</div>;
  }

  return (
    <div style={{ width: '100%', fontFamily: 'Arial, sans-serif' }}>
      <div className="report-container" style={{
          WebkitPrintColorAdjust: 'exact',
          colorAdjust: 'exact',
          printColorAdjust: 'exact'
        }}>
        <div 
          className="header" 
          style={{
            backgroundImage: `url(${bgT})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '3px 3px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '10.5rem',
            position: 'relative'
          }}
        >
          <img 
            src={bgT}
            alt="Background header" 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              top: '0', 
              left: '0', 
              zIndex: -1, 
              objectFit: 'cover' 
            }} 
          />
          <div className="info" style={{ zIndex: 1 }}>
            <h2 style={{ fontSize: '16px', margin: '0', fontWeight: 'bold' }}>Repuestos y Accesorios M&C&, C.A</h2>
            <h2 style={{ fontSize: '16px', margin: '2px 0 0 0', fontWeight: '400', color: '#f7f7f7', textAlign: 'start' }}>J-50242661-2</h2>
            <h2 style={{ fontSize: '16px', margin: '2px 0 0 0', fontWeight: '400', color: '#f7f7f7', textAlign: 'start' }}>AV. Principal de Naguagua</h2>
            <h2 style={{ fontSize: '16px', margin: '2px 0 0 0', fontWeight: '400', color: '#f7f7f7', textAlign: 'start' }}>(0424) 571 50 37</h2>
          </div>
          <div 
            className="logo"
            style={{
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2px',
              flexShrink: '0',
              zIndex: 1
            }}
          >
            <img 
              src={logoBlanco}
              alt={`Logo ${empresa}`} 
              style={{ width: '100px', height: '90px' }} 
            />
          </div>
        </div>
        
        <div 
          className="date-container"
          style={{
            backgroundColor: '#f2f2f2',
            padding: '4px 12px',
            fontSize: '10px',
            borderBottom: '1px solid #ddd'
          }}
        >
          <strong>Fecha:</strong> <span id="current-date">{obtenerFechaActual()}</span>
        </div>
        
        <div className="content" style={{ padding: '8px' }}>
          <h2 style={{ fontSize: '12px', margin: '0 0 6px 0', textAlign: 'center' }}>Productos Menos Vendidos</h2>
          
          <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '8px' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>ID</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Producto</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Código</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Cantidad Vendida</th>
                </tr>
              </thead>
              <tbody>
                {productosMenosVendidos.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>
                      No hay datos de productos vendidos
                    </td>
                  </tr>
                ) : (
                  productosMenosVendidos.map((producto, index) => (
                    <tr 
                      key={producto.producto_id} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                        ...(index === 0 ? { backgroundColor: '#ffebee', fontWeight: 'bold' } : {})
                      }}
                    >
                      <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{producto.producto_id}</td>
                      <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'left' }}>{producto.producto_nombre}</td>
                      <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{producto.producto_codigo}</td>
                      <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{producto.totalProductos}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
        
        <div 
          style={{
            textAlign: 'right',
            fontSize: '8px',
            color: '#666',
            marginTop: '4px',
            padding: '0 8px'
          }}
        >
          <strong>Fecha de generación:</strong> {new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        
        <div 
          className="footer"
          style={{
            backgroundImage: `url(${bgB})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            color: 'white',
            padding: '4px',
            textAlign: 'center',
            borderRadius: '0 0 3px 3px',
            fontSize: '7px',
            color: '#777',
            width: '100%',
            height: '12.5rem',
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center',
            marginTop: '20px',
            position: 'absolute',
            bottom: '0'
          }}
        >
          <img 
            src={bgB}
            alt="Background footer" 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              bottom: '0', 
              left: '0', 
              zIndex: -1, 
            }} 
          />
          <p style={{ marginTop: '3rem', fontSize: '14px', zIndex: 1 }}>
            Reporte generado automáticamente - {empresa} &copy; {año}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReporteProductosMenosVendidos;