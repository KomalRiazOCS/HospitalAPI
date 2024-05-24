// startup/routes.ts
import express, { Express } from 'express';
import patientRouter from '../routes/patient';

export function configureRoutes(app: Express) {
    app.use(express.json());
    app.use('/api/patient', patientRouter);
}