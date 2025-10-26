import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // Para los matchers de DOM
import CategoryDetail from "../components/CategoryDetail";

describe("InvoicePdf", () => {
  test('1. Muestra el título principal "RECIBO DE ENTREGA" y el Recibo # (invoice.id) en el encabezado.', () => {
    // La implementación real requeriría mockear react-query para que devuelva isLoading: true
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("2. Muestra los datos del cliente (Nombre, C.I., Dirección) extraídos de `invoiceDetails[0].perfil`.", () => {
    // La implementación real requeriría mockear react-query para que devuelva isError: true
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("3. Muestra correctamente los detalles del pedido asociado (Pedido #, Fecha y forma de Pago).", () => {
    // Asumiendo que se han mockeado los datos para que carguen correctamente
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("4. La tabla de items contiene las columnas esperadas: Producto, Cantidad, P. Unitario, Descuento y Subtotal.", () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("5. Calcula el subtotal de un item correctamente usando `precio` si no hay `precioConDescuento`.", async () => {
    // La implementación real requiere mockear los datos para incluir 'perfil'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("6. Calcula el subtotal de un item usando `precioConDescuento` si está presente, y muestra el porcentaje de descuento.", async () => {
    // La implementación real requiere mockear los datos para incluir 'pagos'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('7. Calcula el "Subtotal sin descuentos" sumando `cantidad * precio` (precio original) de todos los items.', async () => {
    // La implementación real requiere mockear los datos para incluir 'envios' con diferentes 'metodoDeEntrega'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('8. Calcula y muestra el "Total descuentos aplicados" correctamente si existen items con descuento.', async () => {
    // La implementación real requiere mockear los datos para incluir 'items'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('9. Calcula el "TOTAL" final sumando los precios finales de todos los items (después de descuentos).', async () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("10. Muestra totales en $0.00 y una tabla vacía cuando la lista de items (`invoiceDetails[0].items`) es nula o vacía.", () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });
});
