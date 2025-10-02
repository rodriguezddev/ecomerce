// jest.config.mjs
// Nota: Si usas .ts, debes usar 'import' en lugar de 'require' si importas paths.

/** @type {import('jest').Config} */
const config = {
  // Usamos el preset de TypeScript para Jest
  preset: 'ts-jest',

  // Especifica el entorno de prueba para el navegador
  testEnvironment: 'jsdom',

  // Archivo para configurar @testing-library/jest-dom
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'], 

  // Manejo de módulos CSS, SASS, etc.
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // **IMPORTANTE para proyectos con 'type: "module"' en package.json**
  // Usa el transformador de Jest para manejar archivos JavaScript como módulos CommonJS
  transform: {
      '^.+\\.tsx?$': 'ts-jest',
      '^.+\\.jsx?$': 'babel-jest', // Puede ser necesario para archivos JS puros
  },

  // Opcional: Mapeo de rutas si usas alias en Vite/TS
  // modulePaths: ["<rootDir>"],
  // moduleDirectories: ["node_modules", "src"],
};

// Ahora exportamos con sintaxis ESM
export default config;