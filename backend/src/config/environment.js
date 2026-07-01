require('dotenv').config();

const environment = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || '',
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || '',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || '',
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

function validateEnvironment() {
  const requiredFields = [
    ['MONGO_URI', environment.mongoUri],
    ['JWT_ACCESS_SECRET', environment.accessTokenSecret],
    ['JWT_REFRESH_SECRET', environment.refreshTokenSecret],
  ];

  const missingFields = requiredFields
    .filter(([, value]) => !value)
    .map(([field]) => field);

  if (missingFields.length > 0) {
    throw new Error(`Missing required environment variables: ${missingFields.join(', ')}`);
  }

  return environment;
}

module.exports = {
  environment,
  validateEnvironment,
};