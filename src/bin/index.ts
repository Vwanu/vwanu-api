/* eslint-disable @typescript-eslint/ban-ts-comment */
import app from '../app';
import Logger from '../lib/utils/logger';
import {
  ApiConfigurationType,
  API_CONFIG_SCHEMA,
} from '../schema/serverConf.schema';
import helper from './sever_helper';

const API_CONFIGURATION: ApiConfigurationType = app.get('API_CONFIGURATION');

helper.envConfigurationCheck();

if (API_CONFIG_SCHEMA.safeParse(API_CONFIGURATION)) {
  const {host} = API_CONFIGURATION;
  console.log({API_CONFIGURATION});
  const port = helper.normalizePort(API_CONFIGURATION.port);
 // @ts-ignore
  const server = app.listen(port, host);
  server.on('error', (err) => {helper.onError(err, port as string)});
  server.on('listening', () => {
  app
    .get('sequelizeSync')
    .then(() => {
    helper.onListening(server, host?? '0.0.0.0')
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


