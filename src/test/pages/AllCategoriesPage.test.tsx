// --- Definición de Pruebas ---

describe('AllCategoriesPage', () => {

  test('1. Debería mostrar el estado de carga con skeletons mientras se cargan los datos', async () => {
    // Verifica que se muestren los skeletons de carga para categorías y productos
  });

  test('2. Debería cargar y mostrar correctamente todas las categorías disponibles', async () => {
    // Valida que las categorías se carguen desde el servicio y se muestren en la página
  });

  test('3. Debería filtrar y mostrar solo los productos que pertenecen a cada categoría', async () => {
    // Confirma que los productos se filtren correctamente por categoría
  });
  
  test('4. Debería limitar a 4 productos por categoría en la vista principal', async () => {
    // Verifica que solo se muestren 4 productos máximo por categoría
  });

  test('5. Debería mostrar mensajes de error cuando falla la carga de categorías o productos', async () => {
    // Valida la visualización de mensajes de error tanto para categorías como productos
  });

  test('6. Debería ocultar categorías que no tienen productos disponibles', async () => {
    // Confirma que las categorías sin productos no se muestren en la lista
  });

  test('7. Debería mostrar el enlace "Ver más" que redirige a la página de categoría específica', async () => {
    // Verifica que los enlaces de categoría tengan la ruta correcta
  });

  test('8. Debería filtrar productos con stock mayor a cero para su visualización', async () => {
    // Valida que solo se muestren productos con stock disponible
  });
});