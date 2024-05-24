import express from 'express';
import { connectDB } from './startup/db';
import { configureApp } from './startup/configuration';

import { configureProd } from './startup/prod';
import { configureRoutes } from './startup/routes';

const app = express();
configureApp(app);
connectDB();

configureProd(app);
configureRoutes(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

export { server};
