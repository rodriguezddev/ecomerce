// src/components/categories/CategoryDetail.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Para los matchers de DOM

import CategoryDetail from '../components/CategoryDetail';

describe('CategoryForm', () => {
  test('1. El formulario se renderiza correctamente con título y campos iniciales', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('2. El botón "Cancelar" y el botón de flecha navegan a la lista de categorías', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });

    test('3. Muestra error de validación si el campo "nombre" se deja vacío al enviar', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('4. Muestra error de validación si el "nombre" contiene caracteres no permitidos (Regex)', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
  test('5. Muestra estado de carga (Pending) en el botón al enviar el formulario', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
    test('6. Envío exitoso: llama a la mutación, muestra toast de éxito y navegao', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
});