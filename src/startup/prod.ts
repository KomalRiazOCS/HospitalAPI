// startup/prod.ts
import { Express } from 'express';
import compression from 'compression';
import helmet from 'helmet';

export function configureProd(app: Express) {
    app.use(helmet());
    app.use(compression());
}
