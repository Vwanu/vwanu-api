/* eslint-disable no-unused-vars */
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
// import methodOverride from 'method-override';
import feathers from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { Request, Response, NextFunction } from 'express';

// import channels from './channels';
import services from './services';
import sequelize from './sequelize';
import middleware from './middleware';
import Logger from './lib/utils/logger';
import healthCheck from './services/healthCheck';
import RequestBody from './middleware/RequestBody';
import morganMiddleware from './middleware/morgan.middleware';
import requireLogin from './middleware/requireLogin';
// import AppError from './errors';

const app = express(feathers());
app.configure(configuration());
app.use(express.json());

app.use(cors());
app.use(helmet());
app.use(RequestBody);
// app.use(methodOverride('_method'));
app.use(morgan(':method :url :status', { skip: morganMiddleware }));
app.use(express.urlencoded({ extended: true }));

// Set API configuration from environment variables
const API_CONFIGURATION = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
};
app.set('API_CONFIGURATION', API_CONFIGURATION);

app.configure(express.rest());
app.configure(socketio());
app.configure(sequelize);

app.configure(middleware);
// app.configure(channels);

app.get('/health', healthCheck);

app.use(requireLogin);
app.configure(services);

app.use(express.notFound());

// Combined error handler - handles both logging and response
app.use(
  (err: any, req: Request, res: Response, _: NextFunction) => {
    if (res.headersSent) {
      return;
    }

    // Determine error details
    const status = err.status || err.statusCode || err.code || 500;
    const message = err.message || 'Internal Server Error';
    const errorType = err.constructor?.name || 'Error';

    // Log detailed error information with proper serialization
    const errorDetails = {
      message: message,
      status: status,
      type: errorType,
      url: req.url,
      userAgent: req.get('User-Agent'),
      // Safely serialize any additional error properties
      ...(err.code && { code: err.code }),
      ...(err.name && { name: err.name }),
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && err.stack && { stack: err.stack })
    };

    Logger.error(`${req.method} ${req.path} - ${errorType}: ${message}`, errorDetails);

    // Send JSON error response
    return res.status(status).json({ 
      error: message,
      statusCode: status,
      path: req.path,
      method: req.method
    });
  },
);

export default app;
