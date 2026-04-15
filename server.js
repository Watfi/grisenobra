import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar y ejecutar el servidor generado por Angular
const startServer = async () => {
  try {
    const { default: bootstrap } = await import('./dist/grisenobra/server/server.mjs');
    console.log('✅ Servidor Angular SSR iniciado');
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();
