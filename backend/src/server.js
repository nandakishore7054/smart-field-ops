const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { environment, validateEnvironment } = require('./config/environment');
const { connectDatabase } = require('./config/db');

async function startServer() {
  validateEnvironment();
  await connectDatabase(environment.mongoUri);

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: environment.clientOrigin,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (data) => {
      if (data?.userId) {
        socket.join(data.userId.toString());
      }
      if (data?.role === 'admin' || data?.role === 'dispatcher') {
        socket.join('admin');
      }
    });
  });

  global.io = io;

  server.listen(environment.port, () => {
    console.log(`Backend listening on port ${environment.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend server:', error);
  process.exit(1);
});