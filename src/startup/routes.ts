// startup/routes.ts
import express, { Express } from 'express';
import patientRouter from '../routes/patient';
import appointmentRouter from '../routes/appointment';

export function configureRoutes(app: Express) {
    app.use(express.json());
    app.use('/api/patient', patientRouter);
    app.use('/api/appointment', appointmentRouter);
}