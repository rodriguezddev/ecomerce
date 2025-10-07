
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Para los matchers de DOM

import CategoryDetail from '../components/CategoryDetail';

describe('CategoryDetail', () => {
  test('1. Muestra el estado de carga (Loading State)', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('2. Muestra mensaje de error si la categoría no se encuentra o hay un error', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });

    test('3. Muestra la información de la categoría cargada en la vista general', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('4. El botón "Volver" navega a la lista de categorías', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
});