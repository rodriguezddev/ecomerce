import React from 'react';
import bgT from '../../../assets/bg-t.png';
import bgB from '../../../assets/bg-b.png';
import logoBlanco from '../../../assets/M&C7_logo_blanco.png';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';

interface ProductoInventario {
  id: number;
  nombre: string;
  codigo: string;
  cantidad: number;
}

interface ReporteInventarioProps {
  empresa?: string;
  año?: string;
}

const ReporteInventario: React.FC<ReporteInventarioProps> = ({
  empresa = 'Repuestos y Accesorios M&C&, C.A',
  año = new Date().getFullYear().toString()
}) => {
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getProducts,
  });

  // Filtrar productos con stock mayor a cero
  const productosConStock = products.filter((product: any) => product.stock > 0);

  // Obtener fecha actual formateada
  const obtenerFechaActual = () => {
    const now = new Date();
    return now.toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div>Error al cargar los productos: {(error as Error).message}</div>;
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
          <h2 style={{ fontSize: '12px', margin: '0 0 6px 0', textAlign: 'center' }}>Inventario actual</h2>
          
          <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '8px' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>ID</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Producto</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Código</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {productosConStock.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>
                      No hay productos con stock disponible
                    </td>
                  </tr>
                ) : (
                  productosConStock.map((producto: any, index: number) => (
                    <tr 
                      key={producto.id} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                        ...(producto.stock < 3 ? { backgroundColor: '#fff3cd' } : {})
                      }}
                    >
                      <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{producto.id}</td>
                      <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'left' }}>{producto.nombre}</td>
                      <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{producto.codigo}</td>
                      <td 
                        style={{ 
                          border: '1px solid transparent', 
                          padding: '2px 3px', 
                          textAlign: 'center',
                        }}
                      >
                        {producto.stock}
                       
                      </td>
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
            Este reporte fue generado automáticamente - {empresa} &copy; {año}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReporteInventario;