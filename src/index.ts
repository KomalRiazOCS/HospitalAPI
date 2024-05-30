import express from 'express';
import { connectDB } from './startup/db';
import configureApp from './startup/configuration';
import { configureProd } from './startup/prod';
import { configureRoutes } from './startup/routes';
import { startGameCodeCleanupJob } from './startup/expiredGameCode';
import http from 'http';

let testServer: http.Server;

const app = express();

async function startServer() {
    try {
        await connectDB();
        configureApp();
        configureProd(app);
        configureRoutes(app);
        startGameCodeCleanupJob();

        const port = process.env.PORT || 3000;
        const server = app.listen(port, () => console.log(`Listening on port ${port}...`));
        testServer = server;
        return server;
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
}
export { startServer, testServer };
