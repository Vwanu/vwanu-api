import { Request, Response } from 'express';
import { Application } from '../../declarations';

export default function (app: Application): void {
  // Register the health check route
  app.use('/health', (req: Request, res: Response) => {
    // Return basic health information
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || 'unknown',
    });
  });
}
