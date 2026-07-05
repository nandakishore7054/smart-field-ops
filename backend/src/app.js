const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const submissionsRoutes = require('./modules/submissions/submissions.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const availabilityRoutes = require('./modules/availability/availability.routes');
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

const { attendanceRouter, shiftsRouter } = require('./modules/attendance/attendance.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attendance', attendanceRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api', availabilityRoutes);
app.use('/api', submissionsRoutes);

app.use((_request, _response, next) => {
  next(new ApiError(404, 'The requested resource was not found.'));
});

app.use(errorMiddleware);

module.exports = app;