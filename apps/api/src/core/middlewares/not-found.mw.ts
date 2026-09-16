import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger'; // Assuming you have this imported

export const notFoundMiddleware = (req: Request, res: Response, _next: NextFunction): void => {
  logger.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    code: "ROUTE_NOT_FOUND",
    message: "The requested resource was not found",
    path: req.originalUrl, // originalUrl is better than path (includes query params & base path)
    method: req.method
  });
};