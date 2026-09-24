// Dev-only server: serves the Vite dev build. Not used in the APK build
// (Capacitor packages the static `dist/` output directly).
import express from 'express';
import { createServer as createViteServer } from 'vite';

async function main() {
  const app = express();
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);

  const port = Number(process.env.PORT) || 5173;
  app.listen(port, () => {
    console.log(`Avaye Iran-e Azad dev server running at http://localhost:${port}`);
  });
}

main();
