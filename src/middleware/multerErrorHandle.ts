import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  }
  res.status(500).json({ message: 'An unexpected error occurred' });
}

export default errorHandler;
