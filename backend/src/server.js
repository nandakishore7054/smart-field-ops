const app = require('./app');
const { environment, validateEnvironment } = require('./config/environment');
const { connectDatabase } = require('./config/db');

async function startServer() {
  validateEnvironment();
  await connectDatabase(environment.mongoUri);

  app.listen(environment.port, () => {
    console.log(`Backend listening on port ${environment.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend server:', error);
  process.exit(1);
});