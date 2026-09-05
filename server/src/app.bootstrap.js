import path from 'node:path';
import { globalErrorHandler, sendSuccess } from '#/common/index.js';
import { noteController, userController } from './module/index.js';
import favicon from 'serve-favicon';
import createError from 'http-errors';
import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(
  express.json(),
  morgan('dev'),
  favicon(path.resolve(process.cwd(), 'public', 'fav', 'server.svg'))
);

app.use('/user', userController);
app.use('/note', noteController);
app.get('/', (req, res) => sendSuccess(res, 'hello from backend 🚀', undefined));
app.all('/{*nothing}', (req, res, next) => next(createError(404, 'route is not exist')));

app.use(globalErrorHandler);

export default app;