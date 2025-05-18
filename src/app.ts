/* eslint-disable no-unused-vars */
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
import methodOverride from 'method-override';
import configuration from '@feathersjs/configuration';
import { Request, Response, NextFunction } from 'express';
import feathers from '@feathersjs/feathers';

// /** Custom dependencies */
import channels from './channels';
import database from './database';
import services from './services';
import sequelize from './sequelize';
import middleware from './middleware';
import RequestBody from './middleware/RequestBody';

dotenv.config();

const app = express(feathers());
app.configure(configuration());
app.use(express.json());

app.use(cors());
app.use(helmet());
app.use(RequestBody);
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }));
app.use(methodOverride('_method') as any);
app.use(express.urlencoded({ extended: true }));

// Set API configuration from environment variables
const API_CONFIGURATION = {
  host: process.env.API_HOST || 'localhost',
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
app.configure(services);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', dummy: true, version: '3.0' });
});

app.get('/', (req, res) => {
  res.send('Dummy Express App v5.0 is running with all services!');
});

app.get('/secret', (req, res) => {
  const rdsCredential = {
    dbHost : process.env.DB_HOST,
    dbUser : process.env.DB_USER,
    dbPassword : process.env.DB_PASSWORD,
    dbName : process.env.DB_NAME,
    env : process.env,
    rest:process.env.REST_API_URL
  }
  res.status(200).json({ status: 'healthy', dummy: true, version: '3.0', rdsCredential });
});

app.use(express.notFound());
app.use(express.errorHandler({ logger: console } as any));

app.use((err: Error | any, req: Request, res: Response, next: NextFunction) =>
  res
    .status(err.status || err.code || 500)
    .json({ error: err.message || 'Internal Server Error' })
);

export default app;





