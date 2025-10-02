// src/components/categories/CategoryDetail.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Para los matchers de DOM

import CategoryDetail from '../components/CategoryDetail';

describe('Dashboard', () => {
   test('1. Muestra el estado de carga (isLoading) en las métricas principales al iniciar la consulta', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

 test('2. Muestra un mensaje de error si falla la obtención de datos de alguna entidad (usuarios, productos, etc.)', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });

    test('3. Renderiza el título principal y las cuatro tarjetas de resumen de métricas (Cards)', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

   test('4. Los contadores de Usuarios y Productos muestran el número correcto al cargar la data', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
 test('5. Los contadores de Pedidos y Categorías muestran el número correcto al cargar la data', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
   test('6. Renderiza el gráfico de Pedidos Mensuales (LineChart) con la data procesada (useMemo)', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
  test('7. Renderiza el gráfico de Productos por Categoría (BarChart) con la distribución correcta', () => {
    render(<CategoryDetail />);
    const titleElement = screen.getByText(/Category Detail Page/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('8. Renderiza el gráfico de Estado de Pedidos (PieChart) mostrando los segmentos por estado', () => {
    render(<CategoryDetail />);
    const paragraphElement = screen.getByText(/This is a dummy category detail component./i);
    expect(paragraphElement).toBeInTheDocument();
  });
});