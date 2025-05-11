import app from '../app';
// import Logger from '../lib/utils/logger';
// import {
  // ApiConfigurationType,
  // API_CONFIG_SCHEMA,
// } from '../schema/serverConf.schema';
// import helper from './sever_helper';

// const API_CONFIGURATION: ApiConfigurationType = app.get('API_CONFIGURATION');

const port = 3000;
const Logger = console;

// Configure a middleware for 404s and the error handler

app.listen(port, '0.0.0.0', () => {
  Logger.log(`Server is running on port ${port}`);
});

/*  server.on('error', (err) => {
  helper.onError(err, port);
});

server.on('listening', () => {
  // helper.envConfigurationCheck();
  // app
  //   .get('sequelizeSync')
  //   .then(() => {
  helper.onListening(server, '0.0.0.0');
  // })
  // .catch((error) => {
  //   Logger.error(error);
  //   process.exit(1);
  // });
});

// if (API_CONFIG_SCHEMA.parse(API_CONFIGURATION)) {
//   port = helper.normalizePort(API_CONFIGURATION.port);
// } else {
//   Logger.error('[API configuration] Missing required environment variables');
//   process.exit(1);
// }

*/
