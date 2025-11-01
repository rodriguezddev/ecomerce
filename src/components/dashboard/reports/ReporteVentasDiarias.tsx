import React, { useEffect, useState, useMemo } from 'react';
import bgT from '../../../assets/bg-t.png';
import bgB from '../../../assets/bg-b.png';
import logoBlanco from '../../../assets/M&C7_logo_blanco.png';
import { useQuery } from '@tanstack/react-query';
import { apiBcv, orderService, productService } from '@/services/api';

interface Venta {
  fecha_de_recibo: string;
  numero_de_recibo: string;
  comprador_nombre: string;
  MONTO: string;
  MONTOBS: string;
  PAGOMOVIL: string;
  TRANSFERENCIA: string;
  ZELLE: string;
  EFECTIVOBS: string;
  EFECTIVO: string;
  vendedor_username: string;
}

interface Subtotales {
  total_monto_dolares: number;
  total_monto_bs: number;
  total_pagomovil_bs: number;
  total_transferencia_bs: number;
  total_zelle_dolares: number;
  total_efectivo_bs: number;
  total_efectivo_dolares: number;
}

interface ReporteVentasDiariasProps {
  empresa: string;
  periodoInicial: Date;
  periodoFinal: Date;
  ventasTotales: Venta[];
  subtotales: Subtotales;
  tasabcv: string;
  año: string;
}

const ReporteVentasDiarias: React.FC<ReporteVentasDiariasProps> = ({
  empresa,
  periodoInicial,
  periodoFinal,
  ventasTotales = [],
  subtotales,
  tasabcv,
  año
}) => {
  const [bdvPrice, setBdvPrice] = useState<number | null>(null);

  // Obtener fecha actual formateada
  const obtenerFechaActual = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('es-ES', options);
  };

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await orderService.getOrders();
      return response || [];
    },
  });

  useEffect(() => {
    apiBcv.getBcvPrice()
      .then((response) => {
        if (response) {
          const bcvPrice = response.promedio;
          setBdvPrice(bcvPrice);
        } else {
          console.error("BCV price not found in response");
        }
      })
      .catch(error => {
        console.error("Error fetching BCV price:", error);
      });
  }, []);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getProducts,
    meta: {
      onError: (error: Error) => console.error("Error fetching products:", error),
    }
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

  // Procesar las ventas y calcular subtotales con filtro por fecha
  const { ventasProcesadas, subtotalesCalculados } = useMemo(() => {
    if (bdvPrice === null) {
      return { ventasProcesadas: [], subtotalesCalculados: null };
    }
    // Filtrar órdenes por el rango de fechas
    const ventasValidas = orders.filter((order: any) => {
      if (!order.pagado) return false;

      // Si no hay fechas de filtro, mostrar todas las órdenes
      if (!periodoInicial || !periodoFinal || periodoInicial === new Date() || periodoFinal === new Date()) {
        return true;
      }

      const orderDate = new Date(order.fecha);
      const orderDateFormatted = formatDateForComparison(orderDate);
      const startDateFormatted = formatDateForComparison(periodoInicial);
      const endDateFormatted = formatDateForComparison(periodoFinal);

      // Si las fechas de inicio y fin son iguales, filtrar solo por ese día
      if (startDateFormatted === endDateFormatted) {
        return orderDateFormatted === startDateFormatted;
      }

      // Si son fechas diferentes, usar el rango completo
      return orderDateFormatted >= startDateFormatted && orderDateFormatted <= endDateFormatted;
    });

    let total_monto_dolares_global = 0;
    let total_monto_bs_global = 0;
    let total_pagomovil_bs_global = 0;
    let total_transferencia_bs_global = 0;
    let total_zelle_dolares_global = 0;
    let total_efectivo_dolares_global = 0;
    let total_efectivo_bs_global = 0;

    const ventasProcesadas = ventasValidas.map((order: any) => {
      // Extraer información de pagos
      const pagoMovil = order?.pagos.find((p: any) => p.nombreFormaDePago === 'PAGOMOVIL');
      const transferencia = order?.pagos.find((p: any) => p.nombreFormaDePago === 'TRANSFERENCIA');
      const zelle = order?.pagos.find((p: any) => p.nombreFormaDePago === 'ZELLE');
      const efectivo = order?.pagos.find((p: any) => p.nombreFormaDePago === 'EFECTIVO');

      const pagoMovilMonto = pagoMovil ? pagoMovil.monto : 0;
      const transferenciaMonto = transferencia ? transferencia.monto : 0;
      const zelleMonto = zelle ? zelle.monto : 0;
      const efectivoMonto = efectivo ? efectivo.monto : 0;

      // Aquí asumimos que todos los pagos EFECTIVO son en dólares,
      // y si en algún momento se paga con efectivo en Bs, se tendría que crear otra forma de pago para distinguirlos
      const efectivoDolares = efectivoMonto;
      const efectivoBs = 0;

      // Cálculo del monto total de la venta en bolívares
      const montoBs = (pagoMovilMonto + transferenciaMonto) + ((zelleMonto + efectivoDolares) * bdvPrice);
      // Cálculo del monto total de la venta en dólares
      const montoDolares = (pagoMovilMonto + transferenciaMonto) / bdvPrice + (zelleMonto + efectivoDolares);

      // Sumar a los subtotales globales
      total_monto_dolares_global += montoDolares;
      total_monto_bs_global += montoBs;
      total_pagomovil_bs_global += pagoMovilMonto;
      total_transferencia_bs_global += transferenciaMonto;
      total_zelle_dolares_global += zelleMonto;
      total_efectivo_dolares_global += efectivoDolares;
      total_efectivo_bs_global += efectivoBs;

      return {
        fecha_de_recibo: new Date(order?.fecha).toLocaleDateString('es-ES'),
        numero_de_recibo: order?.factura ? `Recibo ${order.id}` : `Sin factura ${order?.id}`,
        comprador_nombre: `${order?.perfil?.nombre} ${order?.perfil?.apellido}`,
        MONTO: montoDolares.toFixed(2),
        MONTOBS: montoBs.toFixed(2),
        PAGOMOVIL: pagoMovilMonto.toFixed(2),
        TRANSFERENCIA: transferenciaMonto.toFixed(2),
        ZELLE: zelleMonto.toFixed(2),
        EFECTIVO: efectivoDolares.toFixed(2),
        EFECTIVOBS: efectivoBs.toFixed(2),
        vendedor_username: order?.vendedor?.username,
      };
    });

    const subtotalesCalculados = {
      total_monto_dolares: parseFloat(total_monto_dolares_global.toFixed(2)),
      total_monto_bs: parseFloat(total_monto_bs_global.toFixed(2)),
      total_pagomovil_bs: parseFloat(total_pagomovil_bs_global.toFixed(2)),
      total_transferencia_bs: parseFloat(total_transferencia_bs_global.toFixed(2)),
      total_zelle_dolares: parseFloat(total_zelle_dolares_global.toFixed(2)),
      total_efectivo_bs: parseFloat(total_efectivo_bs_global.toFixed(2)),
      total_efectivo_dolares: parseFloat(total_efectivo_dolares_global.toFixed(2)),
    };

    return { ventasProcesadas, subtotalesCalculados };
  }, [orders, bdvPrice, periodoInicial, periodoFinal]); // Añadimos periodoInicial y periodoFinal como dependencias

  if (isLoading || bdvPrice === null) {
    return <div>Cargando órdenes y tasa BCV...</div>;
  }

  if (error) {
    return <div>Error al cargar las órdenes: {error.message}</div>;
  }

  // Si subtotalesCalculados es null, mostramos un mensaje de error o cargando
  if (!subtotalesCalculados) {
    return <div>Cargando totales...</div>;
  }

  return (
    <div style={{ width: '100%', fontFamily: 'Arial, sans-serif' }}>
      <div className="report-container" style={{
        // Añadir esto para impresión
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
            height: '10.5rem'
          }}
        >
          <img
            src={bgT}
            alt={`Logo ${empresa}`}
            style={{ width: '100%', height: '10.5rem', position: 'absolute', top: '0', left: '0', zIndex: -1, }}
          />
          <div className="info">
            <h2 style={{ fontSize: '14px', margin: '0', fontWeight: 'bold' }}>Repuestos y Accesorios M&C&, C.A</h2>
            <h2 style={{ fontSize: '14px', margin: '2px 0 0 0', fontWeight: '400', color: '#f7f7f7', textAlign: 'start' }}>J-50242661-2</h2>
            <h2 style={{ fontSize: '14px', margin: '2px 0 0 0', fontWeight: '400', color: '#f7f7f7', textAlign: 'start' }}>AV. Principal de Naguagua</h2>
            <h2 style={{ fontSize: '14px', margin: '2px 0 0 0', fontWeight: '400', color: '#f7f7f7', textAlign: 'start' }}>(0424) 571 50 37</h2>
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
              position: 'relative',

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
          <h2 style={{ fontSize: '12px', margin: '0 0 6px 0', textAlign: 'center' }}>Registro de Ventas</h2>

          <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '8px' }}>
              <thead>
                <tr>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Fecha</th>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>N° Recibo</th>
                  <th style={{ width: '20%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Cliente</th>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Monto $</th>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Monto Bs</th>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>PagoMóvil. Bs</th>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Transfer. Bs</th>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Zelle $</th>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Efect. $</th>
                  <th style={{ width: '8%', backgroundColor: '#bc1823', fontWeight: 'bold', fontSize: '7px', textAlign: 'center', color: 'white', border: '1px solid transparent', padding: '2px 3px' }}>Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {ventasProcesadas.map((venta, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent' }}>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.fecha_de_recibo}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.numero_de_recibo}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.comprador_nombre}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.MONTO}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.MONTOBS}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.PAGOMOVIL}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.TRANSFERENCIA}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.ZELLE}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.EFECTIVO}</td>
                    <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}>{venta.vendedor_username || "-"}</td>
                  </tr>
                ))}
                <tr className="subtotal" style={{ backgroundColor: 'transparent', fontWeight: 'bold', fontSize: '8px' }}>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'left' }}><strong>SUBTOTAL</strong></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}><strong>{subtotalesCalculados.total_monto_dolares.toFixed(2)}</strong></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}><strong>{subtotalesCalculados.total_monto_bs.toFixed(2)}</strong></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}><strong>{subtotalesCalculados.total_pagomovil_bs.toFixed(2)}</strong></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}><strong>{subtotalesCalculados.total_transferencia_bs.toFixed(2)}</strong></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}><strong>{subtotalesCalculados.total_zelle_dolares.toFixed(2)}</strong></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}><strong>{subtotalesCalculados.total_efectivo_dolares.toFixed(2)}</strong></td>
                  <td style={{ border: '1px solid transparent', padding: '2px 3px', textAlign: 'center' }}></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            className="summary-section"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'end',
              marginTop: '6px',
              gap: '4px'
            }}
          >
            <div className="summary-box">
              <strong>TASA BCV: Bs. {bdvPrice?.toFixed(2) || '0.00'}</strong>
            </div>

            <div
              className="summary-box dollars"
              style={{
                backgroundColor: '#d4edda',
                padding: '4px 8px',
                borderRadius: '3px',
                border: '1px solid #c3e6cb',
                textAlign: 'right'
              }}
            >
              <h3 style={{ fontSize: '8px', margin: '0 0 2px 0', fontWeight: 'bold' }}>TOTAL USD</h3>
              <div className="summary-value" style={{ fontSize: '10px', fontWeight: 'bold', margin: '2px 0' }}>$ {subtotalesCalculados.total_monto_dolares.toFixed(2)}</div>
            </div>

            <div
              className="summary-box bolivares"
              style={{
                backgroundColor: '#d1ecf1',
                padding: '4px 8px',
                borderRadius: '3px',
                border: '1px solid #bee5eb',
                textAlign: 'right'
              }}
            >
              <h3 style={{ fontSize: '8px', margin: '0 0 2px 0', fontWeight: 'bold' }}>TOTAL BS</h3>
              <div className="summary-value" style={{ fontSize: '10px', fontWeight: 'bold', margin: '2px 0' }}>Bs. {subtotalesCalculados.total_monto_bs.toFixed(2)}</div>
            </div>
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
          <strong>Fecha de generación:</strong> {obtenerFechaActual()}
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
          <p style={{ marginTop: '3rem', fontSize: '14px' }}>
            Reporte generado automáticamente - {empresa} &copy; {año}
          </p>
        </div>
      </div>
    </div>
  );
};

// Valores por defecto para las props
ReporteVentasDiarias.defaultProps = {
  empresa: 'Empresa',
  periodoInicial: new Date(),
  periodoFinal: new Date(),
  ventasTotales: [],
  subtotales: {
    total_monto_dolares: 0,
    total_monto_bs: 0,
    total_pagomovil_bs: 0,
    total_transferencia_bs: 0,
    total_zelle_dolares: 0,
    total_efectivo_bs: 0,
    total_efectivo_dolares: 0
  },
  tasabcv: '0',
  año: new Date().getFullYear().toString()
};

export default ReporteVentasDiarias;