const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const authRoutes = require('./modules/auth/auth.routes');
const errorMiddleware = require('./core/middlewares/error.middleware');
const ApiError = require('./core/utils/apiError');
const { environment } = require('./config/environment');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: environment.clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'success',
    data: {
      message: 'Backend is healthy.',
    },
  });
});

app.use('/api/auth', authRoutes);

app.use((_request, _response, next) => {
  next(new ApiError(404, 'The requested resource was not found.'));
});

app.use(errorMiddleware);

module.exports = app;