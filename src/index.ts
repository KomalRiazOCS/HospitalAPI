import express, { Express } from 'express';
import configureRoutes from './startup/routes';
import { connectToDB } from './startup/db';

const app: Express = express();

(async () => {
  try {
    await connectToDB();
    configureRoutes(app);
    
    const port: number | string = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}...`));
  } catch (err) {
    console.error('Error starting the server:', err);
    process.exit(1);
  }
})();

export {app};