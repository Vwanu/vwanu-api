import { Application as ExpressFeathers } from '@feathersjs/express';
import { Sequelize } from 'sequelize-typescript';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes> & {
  get(name: 'sequelizeClient'): Sequelize;
  set(name: 'sequelizeClient', value: Sequelize): this;
};
