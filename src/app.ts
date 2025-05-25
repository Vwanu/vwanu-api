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
import database from './database';
import services from './services';
import sequelize from './sequelize';
import middleware from './middleware';
import Logger from './lib/utils/logger';
import healthCheck from './services/healthCheck';
import RequestBody from './middleware/RequestBody';
import morganMiddleware from './middleware/morgan.middleware';

dotenv.config();

const app = express(feathers());
app.configure(configuration());
app.use(express.json());

app.use(cors());
app.use(helmet());
app.use(RequestBody);
app.use(methodOverride('_method'));
app.use(morgan('dev', { skip: morganMiddleware }));
app.use(express.urlencoded({ extended: true }));

// Set API configuration from environment variables
const API_CONFIGURATION = {
  host: process.env.API_HOST || '0.0.0.0',
  port: process.env.API_PORT || 4000
};
app.set('API_CONFIGURATION', API_CONFIGURATION);

app.configure(express.rest());
app.configure(socketio());
app.configure(sequelize);

app.configure(middleware);
app.configure(channels);
app.configure(database);
app.get('startSequelize')();

app.get('/health', healthCheck);


app.use((req:Request, res:Response, next:NextFunction)=>{
  const token = req.headers.authorization;
  if(!token){
    return res.status(401).json({message:'Unauthorized'})
  }
  next();
})

app.configure(services);






app.use(express.notFound());
app.use(express.errorHandler({ logger: Logger }));

app.use(
  (err: Error & { status?: number; code?: number }, 
    req: Request, res: Response, _: NextFunction) =>
  res
    .status(err.status || err.code || 500)
    .json({ error: err.message || 'Internal Server Error' })
);

export default app;





