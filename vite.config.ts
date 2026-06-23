import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { promises as fs } from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'serve-root-hoopmetrics',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlPath = req.url?.split('?')[0];
            if (urlPath === '/hoopmetrics_import.json') {
              try {
                // Încercăm să citim din rădăcina proiectului (lângă package.json)
                const rootFilePath = path.resolve(process.cwd(), './hoopmetrics_import.json');
                const data = await fs.readFile(rootFilePath, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                return;
              } catch (err) {
                // Dacă nu există la nivel de root, lăsăm middleware-ul standard să verifice în /public/
                next();
              }
            } else {
              next();
            }
          });
        },
        async closeBundle() {
          try {
            // Copiem din root în /dist la build, dacă există fișierul local actualizat
            const src = path.resolve(process.cwd(), './hoopmetrics_import.json');
            const dest = path.resolve(process.cwd(), './dist/hoopmetrics_import.json');
            await fs.copyFile(src, dest);
            console.log('✓ Copiat hoopmetrics_import.json din root în dist/ pentru producție.');
          } catch (err) {
            // Ignorăm eroarea dacă fișierul nu există în root la momentul build-ului
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
