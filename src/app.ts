import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares';
import {
  authRoutes,
  depositsRoutes,
  transferencesRoutes,
  withdrawsRoutes,
  recordsRoutes,
} from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

process.on(
  'unhandledRejection',
  (reason: Error, _promise: Promise<unknown>) => {
    console.log(reason);
  },
);

app.use('/auth', authRoutes);
app.use('/deposits', depositsRoutes);
app.use('/transferences', transferencesRoutes);
app.use('/withdraws', withdrawsRoutes);
app.use('/records', recordsRoutes);

app.use(errorHandler);

export default app;
