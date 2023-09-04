import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middlewares';
import { authRoute, depositsRoute } from './routes';

const app = express();

app.use(express.json());
app.use(cookieParser());

process.on(
  'unhandledRejection',
  (reason: Error, _promise: Promise<unknown>) => {
    console.log(reason);
  },
);

app.use('/auth', authRoute);
app.use('/deposits', depositsRoute);
app.use(errorHandler);

export default app;
