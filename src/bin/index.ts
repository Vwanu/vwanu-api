import app from '../app';
import Logger from '../lib/utils/logger';
import {
  ApiConfigurationType,
  API_CONFIG_SCHEMA,
} from '../schema/serverConf.schema';
import helper from './sever_helper';

const API_CONFIGURATION: ApiConfigurationType = app.get('API_CONFIGURATION');

let port = null;
if (API_CONFIG_SCHEMA.parse(API_CONFIGURATION)) {
  port = helper.normalizePort(API_CONFIGURATION.port);

  // Configure a middleware for 404s and the error handler

  const server = app.listen(port, '0.0.0.0');

  server.on('error', (err) => {
    helper.onError(err, API_CONFIGURATION.port);
  });
  server.on('listening', () => {
    helper.envConfigurationCheck();
    app
      .get('sequelizeSync')
      .then(() => {
        helper.onListening(server, API_CONFIGURATION.host);
      })
      .catch((error) => {
        Logger.error(error);
        process.exit(1);
      });
  });
} else {
  Logger.error('[API configuration] Missing required environment variables');
  process.exit(1);
}
