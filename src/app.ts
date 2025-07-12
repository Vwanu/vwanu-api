/* eslint-disable no-unused-vars */
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
import methodOverride from 'method-override';
import feathers from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import { Request, Response, NextFunction } from 'express';

import channels from './channels';
import services from './services';
import sequelize from './sequelize';
import middleware from './middleware';
import Logger from './lib/utils/logger';
import healthCheck from './services/healthCheck';
import RequestBody from './middleware/RequestBody';
import morganMiddleware from './middleware/morgan.middleware';
import requireLogin from './middleware/requireLogin';
import AppError from './errors';

dotenv.config();

const app = express(feathers());
app.configure(configuration());
app.use(express.json());

app.use(cors());
app.use(helmet());
app.use(RequestBody);
app.use(methodOverride('_method'));
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
app.configure(channels);

app.get('/health', healthCheck);

app.use(requireLogin);
app.configure(services);

app.use(express.notFound());
app.use(express.errorHandler({ logger: Logger }));

app.use(
  (err: unknown | AppError, req: Request, res: Response, _: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err?.status).json({ error: err.message });
    } else {
      return res.status(500).json({ error: err || 'Internal Server Error' });
    }
  },
);

export default app;
