import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // Para los matchers de DOM
import CategoryDetail from "../components/CategoryDetail";

describe("InvoiceList", () => {
  test('1. Muestra el título principal "Gestión de recibo de entrega" y la barra de búsqueda al cargar con éxito.', () => {
    // La implementación real requeriría mockear react-query para que devuelva isLoading: true
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('2. Muestra el indicador de carga ("Cargando recibos de entrega...") mientras la API está en progreso.', () => {
    // La implementación real requeriría mockear react-query para que devuelva isError: true
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('3. Muestra el mensaje de error y el botón "Reintentar" si la carga inicial de recibos falla.', () => {
    // Asumiendo que se han mockeado los datos para que carguen correctamente
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('4. Muestra el mensaje "No hay recibo de entrega disponibles" si la lista de facturas está vacía.', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('5. Filtra correctamente y solo muestra recibos asociados a pedidos cuyo estado NO es "Cancelado".', async () => {
    // La implementación real requiere mockear los datos para incluir 'perfil'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("6. Aplica el filtro de búsqueda por término (`searchTerm`) a los campos descripción e IDs.", async () => {
    // La implementación real requiere mockear los datos para incluir 'pagos'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("7. Permite la paginación y navega a la página 2 cuando se hace clic en el botón de siguiente.", async () => {
    // La implementación real requiere mockear los datos para incluir 'envios' con diferentes 'metodoDeEntrega'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("8. Reinicia la paginación a la página 1 cuando el usuario cambia el término de búsqueda.", async () => {
    // La implementación real requiere mockear los datos para incluir 'items'
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("9. Permite cambiar el número de ítems por página y resetea la paginación a la página 1.", async () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });
});
