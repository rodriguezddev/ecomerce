import React, { useEffect, useState, useMemo } from 'react';
import bgT from '../../../assets/bg-t.png';
import bgB from '../../../assets/bg-b.png';
import logoBlanco from '../../../assets/M&C7_logo_blanco.png';
import { useQuery } from '@tanstack/react-query';
import { orderService, categoryService } from '@/services/api';

interface CategoriaVenta {
  categoria_id: number;
  categoria_nombre: string;
  totalGenerado: number;
  totalProductoPorCategoria: number;
  porcentajeParticipacion: string;
}

interface ReporteVentasCategoriaProps {
  empresa: string;
  periodoInicial: Date;
  periodoFinal: Date;
  año: string;
}

const ReporteVentasCategoria: React.FC<ReporteVentasCategoriaProps> = ({
  empresa = 'Repuestos y Accesorios M&C&, C.A',
  periodoInicial = new Date(),
  periodoFinal = new Date(),
  año = new Date().getFullYear().toString()
}) => {
  const [categoriasData, setCategoriasData] = useState<CategoriaVenta[]>([]);
  const [valorTotalCategorias, setValorTotalCategorias] = useState<number>(0);
  const [unidadesTotal, setUnidadesTotal] = useState<number>(0);

  const {
    data: orders = [],
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await orderService.getOrders();
      return response || [];
    },
  });

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await categoryService.getCategories();
      return response || [];
    },
  });

  // Función para formatear fecha a string legible
  const formatDateToDisplay = (date: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES');
  };

  // Función para convertir fechas a formato comparable (YYYY-MM-DD)
  const formatDateForComparison = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Función para encontrar la categoría de un producto por su ID
  const encontrarCategoriaPorProductoId = (productoId: number) => {
    for (const categoria of categories) {
      const productoEnCategoria = categoria.productos.find((p: any) => p.id === productoId);
      if (productoEnCategoria) {
        return {
          id: categoria.id,
          nombre: categoria.nombre,
          descuento: categoria.descuento || 0
        };
      }
    }
    return null;
  };

  // Procesar datos para obtener ventas por categoría con filtro por fecha
  const procesarDatosCategorias = useMemo(() => {
    // Filtrar órdenes por el rango de fechas y que tengan factura y estén pagadas
    const ordenesValidas = orders.filter((order: any) => {
      if (!order.factura || !order.pagado || order.estado == "Cancelado" ) return false;
      
      // Si no hay fechas de filtro, mostrar todas las órdenes
      if (!periodoInicial || !periodoFinal) {
        return true;
      }
      
      const orderDate = new Date(order.fecha);
      const orderDateFormatted = formatDateForComparison(order.fecha);
      const startDateFormatted = formatDateForComparison(periodoInicial.toString());
      const endDateFormatted = formatDateForComparison(periodoFinal.toString());
      
      // Si las fechas de inicio y fin son iguales, filtrar solo por ese día
      if (startDateFormatted === endDateFormatted) {
        return orderDateFormatted === startDateFormatted;
      }
      
      // Si son fechas diferentes, usar el rango completo
      return orderDateFormatted >= startDateFormatted && orderDateFormatted <= endDateFormatted;
    });

    // Crear un mapa para acumular ventas por categoría
    const ventasPorCategoria = new Map();
    
    // Inicializar el mapa con todas las categorías disponibles (incluyendo las que no tienen ventas)
    categories.forEach((category: any) => {
      ventasPorCategoria.set(category.id, {
        id: category.id,
        nombre: category.nombre,
        totalGenerado: 0,
        unidadesVendidas: 0
      });
    });
    
    let totalIngresos = 0;
    let totalUnidades = 0;

    // Procesar cada orden válida
    ordenesValidas.forEach((order: any) => {
      order.items.forEach((item: any) => {
        // Buscar la categoría del producto usando su ID
        const categoriaInfo = encontrarCategoriaPorProductoId(item.producto.id);
        const categoriaId = categoriaInfo?.id || 0;
        const categoriaNombre = categoriaInfo?.nombre || 'Sin categoría';
        const descuento = categoriaInfo?.descuento || 0;
        
        // ✅ CALCULAR PRECIO CON DESCUENTO (producto o categoría)
        const precioUnitario = item.producto.descuento > 0
          ? item.producto.precio - (item.producto.precio * item.producto.descuento / 100)
          : (descuento > 0 && item.producto.aplicarDescuentoCategoria)
            ? item.producto.precio - (item.producto.precio * descuento / 100)
            : item.producto.precio;
        const subtotal = item.cantidad * precioUnitario;
        
        // Si la categoría no existe en el mapa, crearla
        if (!ventasPorCategoria.has(categoriaId)) {
          ventasPorCategoria.set(categoriaId, {
            id: categoriaId,
            nombre: categoriaNombre,
            totalGenerado: 0,
            unidadesVendidas: 0
          });
        }
        
        // Obtener la categoría actual
        const categoriaActual = ventasPorCategoria.get(categoriaId);
        
        // Actualizar valores
        categoriaActual.totalGenerado += subtotal;
        categoriaActual.unidadesVendidas += item.cantidad;
        
        // Actualizar el mapa
        ventasPorCategoria.set(categoriaId, categoriaActual);
        
        // Actualizar totales generales
        totalIngresos += subtotal;
        totalUnidades += item.cantidad;
      });
    });

    // Convertir el mapa a array - MOSTRAR TODAS LAS CATEGORÍAS, INCLUSO LAS SIN VENTAS
    const categoriasArray = Array.from(ventasPorCategoria.values())
      .map(categoria => ({
        categoria_id: categoria.id,
        categoria_nombre: categoria.nombre,
        totalGenerado: categoria.totalGenerado,
        totalProductoPorCategoria: categoria.unidadesVendidas,
        porcentajeParticipacion: totalIngresos > 0 
          ? `${((categoria.totalGenerado / totalIngresos) * 100).toFixed(2)}%` 
          : '0.00%'
      }));

    // Ordenar por total generado (descendente) - las sin ventas quedarán al final
    categoriasArray.sort((a, b) => b.totalGenerado - a.totalGenerado);

    return {
      categorias: categoriasArray,
      totalIngresos,
      totalUnidades
    };
  }, [orders, categories, periodoInicial, periodoFinal]);

  useEffect(() => {
    setCategoriasData(procesarDatosCategorias.categorias);
    setValorTotalCategorias(procesarDatosCategorias.totalIngresos);
    setUnidadesTotal(procesarDatosCategorias.totalUnidades);
  }, [procesarDatosCategorias]);

  if (isLoadingOrders || isLoadingCategories) {
    return <div>Cargando datos...</div>;
  }

  if (ordersError || categoriesError) {
    return <div>Error al cargar los datos: {(ordersError || categoriesError)?.message}</div>;
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
          <strong>Fecha:</strong> <span id="current-date">{formatDateToDisplay(periodoInicial)} - {formatDateToDisplay(periodoFinal)}</span>
        </div>
        
        <div className="content" style={{ padding: '8px' }}>
          <h2 style={{ fontSize: '12px', margin: '0 0 6px 0', textAlign: 'center' }}>Ventas por Categoría</h2>
          
          <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '8px' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>#</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Categoría</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Ingreso</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Unidades Vendidas</th>
                  <th style={{ backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Porcentaje de participación en ventas</th>
                </tr>
              </thead>
              <tbody>
                {categoriasData.map((categoria, index) => (
                  <tr 
                    key={categoria.categoria_id} 
                    style={{ 
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                      ...(categoria.totalGenerado > 0 && index === 0 ? { backgroundColor: '#e8f5e9', fontWeight: 'bold' } : {})
                    }}
                  >
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{categoria.categoria_id}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'left' }}>{categoria.categoria_nombre}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>${categoria.totalGenerado.toFixed(2)}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{categoria.totalProductoPorCategoria}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{categoria.porcentajeParticipacion}</td>
                  </tr>
                ))}
                {/* FILA DE TOTALES */}
                <tr style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'left' }}>Total</td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>${valorTotalCategorias.toFixed(2)}</td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{unidadesTotal}</td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>100%</td>
                </tr>
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
              alt={`Logo ${empresa}`} 
              style={{ width: '100%', height: '10.5rem', position: 'absolute', bottom: '0', left: '0', zIndex: -1, }} 
            />
          <p style={{ marginTop: '3rem', fontSize: '14px', zIndex: 1 }}>
            Reporte generado automáticamente - {empresa} &copy; {año}
          </p>
        </div>
      </div>
    </div>
  );
};

// Valores por defecto para las props
ReporteVentasCategoria.defaultProps = {
  empresa: 'Repuestos y Accesorios M&C&, C.A',
  periodoInicial: new Date(),
  periodoFinal: new Date(),
  año: new Date().getFullYear().toString()
};

export default ReporteVentasCategoria;