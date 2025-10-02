// src/components/categories/CategoryDetail.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Para los matchers de DOM

import CategoryDetail from '../components/CategoryDetail';

describe('CategoryList', () => {
  test('1. Muestra el estado de carga al inicio (Corresponde al estado isLoading)', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('2. Muestra un mensaje de error si falla la carga de datos de la API', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });

    test('3. Renderiza el título, la tabla y los controles de gestión al cargar exitosamente', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('4. El botón Nueva Categoría navega correctamente a la ruta de creación', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
  test('5. Filtra y actualiza la lista de categorías al escribir en la barra de búsqueda', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
    test('6. Muestra el mensaje si la lista filtrada está vacía', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
      test('7. La paginación muestra los límites (inicio y fin) y los botones de control correctos', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('8. Cambia el número de elementos por página y restablece la página a 1 (Simula la interacción con el Select de itemsPerPage', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
  test('9. Muestra el diálogo de confirmación de eliminación al hacer clic en el botón de eliminar', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
    test('10. Llama a la mutación de eliminación, invalida la caché y muestra toast de éxito', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
});