import express from 'express';
import punycode from 'punycode/';
import usersRouter from '../routes/users';
import authRouter from '../routes/auth';
import errorHandler from '../middleware/multerErrorHandle';

export default function configureRoutes(app: express.Application) {
  app.use(express.json());
  app.use('/api/users', usersRouter);
  app.use('/api/auth', authRouter);
  app.use(errorHandler);
}
