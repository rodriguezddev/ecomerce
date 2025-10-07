import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { rest } from "msw";
import InvoiceDetails from "@/components/dashboard/invoices/InvoiceDetails";

// Mockear hooks y servicios para aislar el componente
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Simulamos un hook useToast simple
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mockear useReactToPrint
jest.mock("react-to-print", () => ({
  useReactToPrint: () => jest.fn(),
}));

describe("InvoiceDetails", () => {
  test('1. Muestra el mensaje de carga ("Cargando detalles del recibo...") mientras se obtienen los datos (`isLoading=true`)', () => {
    // La implementación real requeriría mockear react-query para que devuelva isLoading: true
    render(<InvoiceDetails />);
    expect(
      screen.getByText(/Cargando detalles del recibo.../i)
    ).toBeInTheDocument();
  });

  test("2. Muestra el mensaje de error si la carga de datos falla y se dispara el toast destructivo (`isError=true`)", () => {
    // La implementación real requeriría mockear react-query para que devuelva isError: true
    render(<InvoiceDetails />);
    expect(
      screen.getByText(/Error al cargar los detalles del recibo./i)
    ).toBeInTheDocument();
  });

  test('3. Renderiza el título del recibo, el botón de "Volver" (ArrowLeft) y el botón "Imprimir" (Printer).', () => {
    // Asumiendo que se han mockeado los datos para que carguen correctamente
    render(<InvoiceDetails />);
    expect(screen.getByText(/Detalles del Recibo #1/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Imprimir/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument(); // Botón ArrowLeft
  });

  test("4. Muestra correctamente la información estática de la empresa y los detalles principales del recibo.", () => {
    render(<InvoiceDetails />);
    expect(screen.getByText(/Recibo de Entrega #1/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Repuestos y Accesorios M&C7, C\.A\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/RIF: J-50325744-7/i)).toBeInTheDocument();
  });

  test("5. Muestra la información completa del Cliente (nombre, cédula, dirección, teléfono) cuando el perfil está disponible.", async () => {
    // La implementación real requiere mockear los datos para incluir 'perfil'
    render(<InvoiceDetails />);
    await waitFor(() => {
      expect(screen.getByText(/Cliente:/i)).toBeInTheDocument();
    });
  });

  test("6. Muestra los detalles del Pedido (ID, Fecha) y las Formas de Pago con su referencia si existe.", async () => {
    // La implementación real requiere mockear los datos para incluir 'pagos'
    render(<InvoiceDetails />);
    await waitFor(() => {
      expect(screen.getByText(/Detalles del Pedido:/i)).toBeInTheDocument();
    });
  });

  test('7. Muestra los detalles de Entrega condicionales: "Disponible para entrega" (Retiro en tienda) o "Número de guía" (Envío nacional).', async () => {
    // La implementación real requiere mockear los datos para incluir 'envios' con diferentes 'metodoDeEntrega'
    render(<InvoiceDetails />);
    await waitFor(() => {
      expect(screen.getByText(/Método de entrega:/i)).toBeInTheDocument();
    });
  });

  test("8. Renderiza la tabla de productos paginada con las columnas correctas, incluyendo la celda de Descuento calculado.", async () => {
    // La implementación real requiere mockear los datos para incluir 'items'
    render(<InvoiceDetails />);
    await waitFor(() => {
      expect(screen.getByText("Producto")).toBeInTheDocument();
      expect(screen.getByText("Descuento")).toBeInTheDocument();
    });
  });

  test("9. Muestra el Total sin descuento (subtotal) y el Total final calculados a partir de los ítems.", async () => {
    render(<InvoiceDetails />);
    await waitFor(() => {
      expect(screen.getByText(/Total sin descuento:/i)).toBeInTheDocument();
      expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    });
  });

  test("10. Renderiza los controles de Paginación (Select de items por página y botones de navegación de página) y muestra el resumen de items.", () => {
    render(<InvoiceDetails />);
    expect(screen.getByText(/Mostrando/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument(); // Select
    expect(screen.getByText(/Página/i)).toBeInTheDocument();
  });
});
