import { globalErrorHandler, sendSuccess } from './common/index.js';
import { noteController, userController } from './module/index.js';
import createError from 'http-errors';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

export const app = express();
export default app;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
  express.json(),
  morgan('dev'),
);

app.use('/user', userController);
app.use('/note', noteController);
app.get('/', (req, res) => sendSuccess({ res, message: 'hello from backend 🚀' }));
app.all('/{*nothing}', (req, res, next) => next(createError(404, 'route is not exist')));

app.use(globalErrorHandler);
