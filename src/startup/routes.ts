import express, { Express } from 'express';
import users from '../routes/users';

export function configureRoutes(app: Express) {
    app.use(express.json());
    app.use('/api', users);
}