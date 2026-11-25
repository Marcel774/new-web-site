import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createBackendApp } from './backend/app.ts';
import { connectDB } from './backend/config/db.ts';
import { seedInitialCatalogIfEmpty } from './backend/seed/seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectDB();
  await seedInitialCatalogIfEmpty();

  const app = createBackendApp();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MOVIEFLIX] Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[MOVIEFLIX] Fatal startup error:', err);
  process.exit(1);
});
