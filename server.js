const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeWebSockets } = require('./server/websocket');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

// Inicializa Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Crea el servidor HTTP
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Inicializa el servidor de WebSockets adjuntándolo al servidor HTTP
  initializeWebSockets(server);

  // Escucha en el puerto 3000
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Servidor listo en http://${hostname}:${port}`);
    console.log(`> WebSockets funcionando en el mismo puerto.`);
  });
}).catch((err) => {
  console.error('Error iniciando Next.js', err);
  process.exit(1);
});
