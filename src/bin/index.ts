/* eslint-disable @typescript-eslint/ban-ts-comment */
import app from '../app';
import { createLogger } from '../lib/utils/logger';
import {
  ApiConfigurationType,
  API_CONFIG_SCHEMA,
} from '../schema/serverConf.schema';
import helper from './sever_helper';

const logger = createLogger('bin/index');
const API_CONFIGURATION: ApiConfigurationType = app.get('API_CONFIGURATION');

const exitProcess = (message: string, error?: Error) => {
  logger.error(message, error);
  process.exit(1);
}

async function startServer() {
  try {
    // Validate environment configuration
    try {
      await helper.envConfigurationCheck();
    } catch (error) {
      exitProcess(`Server cannot start missing required environment variables`, error as Error);
    }

    if (!API_CONFIG_SCHEMA.safeParse(API_CONFIGURATION).success) {
      exitProcess('[API configuration] Missing required environment variables');
    }

    logger.info('Initializing database connection...');
    
    // Test database connectivity first
    const sequelizeClient = app.get('sequelizeClient');
    if (sequelizeClient) {
      try {
        await sequelizeClient.authenticate();
        logger.info('Database connection established successfully');
        
        // Sync database models (only in development)
        if (process.env.NODE_ENV === 'development') {
          await sequelizeClient.sync({ alter: false });
          logger.info('Database models synchronized');
        }
      } catch (dbError) {
        exitProcess('Database connection failed:', dbError as Error);
      }
    } else {
      logger.warn('No database client found, starting server without database');
    }

      const { host } = API_CONFIGURATION;
   
    const port = helper.normalizePort(API_CONFIGURATION.port);
    // Start HTTP server only after database is ready
    logger.info(`Starting HTTP server on ${host}:${port}...`);
    
    // @ts-ignore
    const server = app.listen(port, host);
    
    server.on('error', (err) => {
      helper.onError(err, port as number, exitProcess);
    });
    
    server.on('listening', () => {
      helper.onListening(server, host ?? '0.0.0.0');
      logger.info('Server startup completed successfully');
    });

  } catch (error) {
    logger.error('Failed to start server:', error as Error);
    process.exit(1);
  }
}

// Start the server
startServer()
.catch((error) => {
  exitProcess('Unhandled error during server startup:', error);
});


