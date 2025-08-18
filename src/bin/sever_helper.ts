/**
 * Helper functions for server startup and error handling.
 *
 * @remarks
 * This module provides functions to handle server listening events, errors,
 * port normalization, and environment variable checks.
 */

import { Server } from 'http';
import { createLogger } from '../lib/utils/logger';

const logger = createLogger('server-helper');

export default {
  onListening(server: Server, host?: string) {
    const addr = server.address();
    const bind: string | null =
      typeof addr === 'string' ? `pipe  ${addr}` : `port ${addr?.port}`;
    let message = `Listening on ${bind}`;
    console.log({addr});
    if (host) message += ` from host ${host}`;
    logger.info(message);
  },
  /**
   * Handles server 'listen' errors by logging appropriate messages and exiting the process.
   *
   * @param error - The error object thrown during server startup.
   * @param port - The port or pipe on which the server was attempting to listen.
   * @param exitProcess - A function to call to exit the process with a message.
   *
   * @remarks
   * - If the error is not related to 'listen', it is re-thrown.
   * - For 'EACCES', logs a message about required privileges and exits.
   * - For 'EADDRINUSE', logs a message about the port/pipe being in use and exits.
   * - For other errors, logs the error and exits.
   */
  onError(error: Error, port: number, exitProcess: (message: string) => void): void {
    const err = error as NodeJS.ErrnoException;
    if (err.syscall !== 'listen') throw error;
    const bind = `Port ${port}`;
    switch (err.code) {
      case 'EACCES':
        exitProcess(`${bind} requires elevated privileges`);
        break;
      case 'EADDRINUSE':
        exitProcess(`${bind} is already in use`);
        break;
      default:
        exitProcess('An unknown error occurred');
    }
  },
  /**
   * Normalizes a port into a number, string, or null.
   * @param val - The port value to normalize.
   * @returns The normalized port, or null if invalid.
   */
  normalizePort(val: string | number): number | string | null {
    const port = typeof val === 'string' ? parseInt(val, 10) : val;
    if (typeof port !== 'number' || isNaN(port)) return null;
    if (port >= 0) return port;
    return null;
  },
  /**
   * Checks if required environment variables are set.
   * @returns A promise that resolves if all required environment variables are set, or rejects with an error message.
   */
  envConfigurationCheck(): Promise<void> {
    return new Promise((resolve, reject) => {
    const mustHaveEnvVars = [
      'DB_HOST',
      'DB_DATABASE',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'clientId',
      'userPoolId',
      'CLOUDINARY_API_SECRET',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_CLOUD_NAME',
      'maxPostVideos',
      'maxPostAudios',
      'maxPostImages',
      'maxMessageImages',
      'maxDiscussionVideos',
      'maxDiscussionAudios',
      'maxDiscussionImages'];
    if(!mustHaveEnvVars.length ) {
      reject(`Required environment variables are not set`);
    };
    const missingEnvVars = mustHaveEnvVars.filter((envVar) => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      reject(`Server cannot start missing required environment variables: ${missingEnvVars.join(', ')}`);
    } else {
      resolve();
    }
  });
  },
};
