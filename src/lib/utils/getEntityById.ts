/* eslint-disable no-underscore-dangle */

import { createLogger } from './logger';

const logger = createLogger('getEntityById');

/**
 * This function gets an entity by id from a the database it throws an error if the entity is not found in the database
 *
 * @param {Partial<HookContext>} service - this is the service that is used to get the entity
 * @param {number} id - this is the id of the entity
 * @returns {HookContext} Promise<any> - returns the entity
 */
export default async (service: any, id: string | number) => {
  try {
    const entity = await service._get(id);
    return entity;
  } catch (error) {
    logger.error('Error getting entity by id', error);
    throw error;
  }
};
