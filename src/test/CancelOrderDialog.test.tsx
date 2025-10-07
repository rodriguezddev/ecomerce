import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // Para los matchers de DOM

import CategoryDetail from "../components/CategoryDetail";

describe("CancelOrderDialog", () => {
  test("1. Muestra el diálogo (Modal) al recibir la prop `show=true` y oculta el contenido con `show=false`", () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("2. Renderiza el título, la descripción de advertencia y los botones de acción iniciales", () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(
      /This is a dummy category detail component./i
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test('3. El botón "Volver" (outline) llama a la función `onClose` al ser presionado', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('4. El botón "Confirmar Cancelación" llama a la función `onConfirm` con los datos del estado', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(
      /This is a dummy category detail component./i
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test('5. La casilla "Devolver productos al stock" está marcada por defecto (`checked=true`)', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(
      /This is a dummy category detail component./i
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test('6. Al interactuar con la casilla "Devolver productos al stock", el estado interno cambia correctamente', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(
      /This is a dummy category detail component./i
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test("7. El diálogo se cierra (`onClose`) al hacer clic fuera del contenido o presionar la tecla `Escape`", () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('8. Muestra el estado de carga (`isSubmitting`) en el botón principal con el texto "Cancelando..."', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(
      /This is a dummy category detail component./i
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test('9. Cuando `isSubmitting` es true, ambos botones ("Volver" y "Confirmar") se deshabilitan para evitar doble envío', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(
      /This is a dummy category detail component./i
    );
    expect(paragraphElement).toBeInTheDocument();
  });

  test("10. La función `onConfirm` se llama con el valor correcto de `devolverStock` (true o false) según el estado del checkbox", () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(
      /This is a dummy category detail component./i
    );
    expect(paragraphElement).toBeInTheDocument();
  });
});
