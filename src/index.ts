import express, { Application }from 'express';
import configureRoutes from './startup/routes'
import connectToDatabase from './startup/db';
import checkJwtPrivateKey from './startup/config';
import http from 'http';

const app: Application = express();

let testServer: http.Server;

const startServer = async (): Promise<http.Server> => {
  configureRoutes(app);
  await connectToDatabase();
  checkJwtPrivateKey();

  const port: number | string = process.env.PORT || 3000;
  const server: http.Server = app.listen(port, () => console.log(`Listening on port ${port}...`));
  testServer = server;
  return server;
};

startServer();

export { startServer, testServer };
