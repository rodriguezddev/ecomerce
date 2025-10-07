import { formatDate } from "@/lib/utils";
import { Pedido } from "@/types";
import bgT from '../../../assets/bg-t.png';
import bgB from '../../../assets/bg-b.png';
import logoBlanco from '../../../assets/M&C7_logo_blanco.png';

interface InvoicePDFProps {
  invoice: {
    id: number;
    descripcion: string;
  };
  invoiceDetails: Pedido[];
}

export const InvoicePDF = ({ invoice, invoiceDetails }: InvoicePDFProps) => {
  // Calcular subtotal sin descuentos (precio original)
  const calculateSubtotal = () => {
    if (!invoiceDetails[0]?.items) return 0;
    return invoiceDetails[0].items.reduce((sum, item) => {
      return sum + (item.cantidad * item.producto.precio);
    }, 0);
  };

  // Calcular total con descuentos aplicados
  const calculateTotal = () => {
    if (!invoiceDetails[0]?.items) return 0;
    return invoiceDetails[0].items.reduce((sum, item) => {
      // Usar precioConDescuento si está disponible, sino usar precio normal
      const precioFinal = item.producto.precioConDescuento || item.producto.precio;
      return sum + (item.cantidad * precioFinal);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  
  // Calcular el total de descuentos aplicados
  const totalDescuentos = invoiceDetails[0]?.items?.reduce((sum, item) => {
    if (item.producto.precioConDescuento) {
      const descuentoPorUnidad = item.producto.precio - item.producto.precioConDescuento;
      return sum + (item.cantidad * descuentoPorUnidad);
    }
    return sum;
  }, 0) || 0;

  // Calcular porcentaje de descuento para mostrar
  const calcularPorcentajeDescuento = (producto: any) => {
    if (producto.precioConDescuento && producto.precio > 0) {
      return ((producto.precio - producto.precioConDescuento) / producto.precio * 100).toFixed(1);
    }
    return "0";
  };

  return (
    <div className="pdf-container" style={{ fontFamily: 'Arial, sans-serif', position: 'relative', minHeight: '100vh' }}>
      {/* Header con imagen */}
      <div style={{
        position: 'relative',
        height: '180px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px 20px 20px',
        color: 'white',
        overflow: 'hidden'
      }}>
        <img 
          src={bgT}
          alt="Header background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1
          }}
        />
        
        <div>
          <h2 style={{ fontSize: '16px', margin: 0 }}>Repuestos y Accesorios M&C7, C.A</h2>
          <p style={{ fontSize: '12px', margin: '4px 0' }}>RIF: J-50325744-7</p>
          <p style={{ fontSize: '12px', margin: '4px 0' }}>Naguanagua, Carabobo</p>
        </div>
        
        <img 
          src={logoBlanco}
          alt="Logo" 
          style={{ 
            width: '150px', 
            height: '80px',
            padding: '5px' 
          }} 
        />
      </div>

      {/* Fecha y título */}
      <div style={{ 
        backgroundColor: '#f2f2f2', 
        padding: '8px 16px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px'
      }}>
        <div>
          <strong>Fecha:</strong> {formatDate(new Date())}
        </div>
        <div>
          <strong>Recibo #:</strong> {invoice?.id}
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '20px', paddingBottom: '150px' }}>
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '18px',
          margin: '10px 0',
          color: '#bc1823'
        }}>
          RECIBO DE ENTREGA
        </h1>

        {/* Información del cliente */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px',
          fontSize: '12px'
        }}>
          <div>
            <h3 style={{ 
              fontSize: '14px',
              borderBottom: '1px solid #ddd',
              paddingBottom: '4px',
              margin: '0 0 8px 0'
            }}>
              CLIENTE:
            </h3>
            {invoiceDetails[0]?.perfil ? (
              <div>
                <p style={{ fontWeight: 'bold', margin: '4px 0' }}>
                  {invoiceDetails[0].perfil.nombre} {invoiceDetails[0].perfil.apellido}
                </p>
                <p style={{ margin: '4px 0' }}>C.I: {invoiceDetails[0].perfil.cedula}</p>
                <p style={{ margin: '4px 0' }}>{invoiceDetails[0].perfil.direccion}</p>
                <p style={{ margin: '4px 0' }}>Tel: {invoiceDetails[0].perfil.numeroTelefono}</p>
              </div>
            ) : (
              <p>Sin información del cliente.</p>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <h3 style={{ 
              fontSize: '14px',
              borderBottom: '1px solid #ddd',
              paddingBottom: '4px',
              margin: '0 0 8px 0'
            }}>
              DETALLES:
            </h3>
            <div>
              <p style={{ margin: '4px 0' }}><strong>Pedido #:</strong> {invoiceDetails[0]?.id}</p>
              {invoiceDetails[0]?.fecha && (
                <p style={{ margin: '4px 0' }}><strong>Fecha:</strong> {formatDate(invoiceDetails[0]?.fecha)}</p>
              )}
              <p style={{ margin: '4px 0' }}>
                <strong>Pago:</strong> {invoiceDetails[0]?.pagos?.map(pago => pago.nombreFormaDePago).join(', ') || 'N/A'}
              </p>
              {invoiceDetails[0]?.pagos?.[0]?.numeroReferencia && (
                <p style={{ margin: '4px 0' }}>
                  <strong>Referencia:</strong> {invoiceDetails[0].pagos[0].numeroReferencia}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '10px 0',
          fontSize: '12px'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#bc1823',
              color: 'white'
            }}>
              <th style={{ 
                padding: '8px',
                textAlign: 'left',
                border: '1px solid #ddd'
              }}>Producto</th>
              <th style={{ 
                padding: '8px',
                textAlign: 'center',
                border: '1px solid #ddd',
                width: '12%'
              }}>Cantidad</th>
              <th style={{ 
                padding: '8px',
                textAlign: 'right',
                border: '1px solid #ddd',
                width: '15%'
              }}>P. Unitario</th>
              <th style={{ 
                padding: '8px',
                textAlign: 'right',
                border: '1px solid #ddd',
                width: '12%'
              }}>Descuento</th>
              <th style={{ 
                padding: '8px',
                textAlign: 'right',
                border: '1px solid #ddd',
                width: '15%'
              }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoiceDetails[0]?.items?.map((item, index) => {
              const precioFinal = item.producto.precioConDescuento || item.producto.precio;
              const porcentajeDescuento = calcularPorcentajeDescuento(item.producto);
              
              return (
                <tr 
                  key={item.id}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <td style={{ padding: '8px' }}>{item.producto.nombre}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{item.cantidad}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ${item.producto.precio.toFixed(2)}
                    {item.producto.precioConDescuento && item.producto.precioConDescuento < item.producto.precio && (
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        ${item.producto.precioConDescuento.toFixed(2)} final
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    {porcentajeDescuento !== "0" ? `${porcentajeDescuento}%` : '-'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ${(item.cantidad * precioFinal).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ 
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{ 
            width: '40%',
            fontSize: '12px'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span>Subtotal sin descuentos:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {totalDescuentos > 0 && (
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                color: 'green'
              }}>
                <span>Total descuentos aplicados:</span>
                <span>-${totalDescuentos.toFixed(2)}</span>
              </div>
            )}
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '14px',
              borderTop: '1px solid #333',
              paddingTop: '8px',
              marginTop: '8px'
            }}>
              <span>TOTAL:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con imagen */}
      <div style={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '150px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '20px'
      }}>
        <img 
          src={bgB}
          alt="Background footer" 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1
          }} 
        />
        <p style={{ 
          color: '#777',
          fontSize: '10px',
          textAlign: 'center',
          margin: 0,
          position: 'relative',
          zIndex: 1
        }}>
          Este documento es un comprobante de entrega - Repuestos y Accesorios M&C7, C.A © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};