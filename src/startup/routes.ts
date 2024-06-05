import express, { Express } from 'express';
import todoRouter from '../routes/todo';

export default function configureRoutes(app: Express): void {
  app.use(express.json());
  app.use('/api/', todoRouter);
}
