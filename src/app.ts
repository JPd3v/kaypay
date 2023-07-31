import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middlewares';
import { authRoute } from './routes';

const app = express();

app.use(express.json());

app.use('/auth', authRoute);
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
