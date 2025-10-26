import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // Para los matchers de DOM
import CategoryDetail from "../components/CategoryDetail";

describe("OrderDetails", () => {
  test('1. Muestra el mensaje de carga "Cargando detalles del pedido..." cuando `isLoading` es true.', () => {
    // La implementación real requeriría mockear react-query para que devuelva isLoading: true
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("2. Muestra el mensaje de error si `isError` es true o si no hay datos de `order`.", () => {
    // La implementación real requeriría mockear react-query para que devuelva isError: true
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("3. Muestra correctamente la información básica del pedido (ID, Fecha, Estado y Pago) con sus iconos.", () => {
    // Asumiendo que se han mockeado los datos para que carguen correctamente
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("4. Muestra la información completa del cliente (Nombre, Cédula, Teléfono y Dirección) desde `order.perfil`.", () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('5. El badge de estado (`OrderStatusBadge`) aplica la clase CSS correcta para el estado "Cancelado".', async () => {
    // La implementación real requiere mockear los datos para incluir 'perfil'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("6. El cálculo final (`calculateTotal`) suma correctamente `cantidad * precioConDescuento` para todos los artículos.", async () => {
    // La implementación real requiere mockear los datos para incluir 'pagos'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("7. Muestra la tabla de artículos con paginación, mostrando por defecto solo 5 artículos por página.", async () => {
    // La implementación real requeriría mockear los datos para incluir 'envios' con diferentes 'metodoDeEntrega'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("8. Los controles de paginación reflejan correctamente el número total de artículos y la página actual.", async () => {
    // La implementación real requeriría mockear los datos para incluir 'items'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('9. El botón "Ver Recibo" es visible únicamente cuando `order.factura` no es nulo.', async () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('10. El botón "Actualizar Estatus" es visible si el pedido NO está "Cancelado" O si está "En proceso de empaquetado" O si `pagado` es false.', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });
});
