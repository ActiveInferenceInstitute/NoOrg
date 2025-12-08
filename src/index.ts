import http from 'http';
import * as dotenv from 'dotenv';
import { MultiAgentCoordinator } from './core/multiagent/MultiAgentCoordinator';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

async function main() {
  const coordinator = MultiAgentCoordinator.getInstance();

  const initialized = await coordinator.initialize();
  if (!initialized) {
    throw new Error('Failed to initialize coordinator');
  }

  const started = await coordinator.start();
  if (!started) {
    throw new Error('Failed to start coordinator');
  }

  const server = http.createServer(async (_req, res) => {
    if (_req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  server.listen(PORT, () => {
    console.info(`NoOrg coordinator listening on port ${PORT}`);
  });

  const shutdown = async () => {
    console.info('Shutting down...');
    await coordinator.stop();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal error starting coordinator', err);
  process.exit(1);
});

