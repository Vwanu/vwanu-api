import { BadRequest } from '@feathersjs/errors';
import { requireAuth } from '../../Hooks/requireAuth';


export default {
  before: {
    all: [],
    get: [requireAuth],
    find: [requireAuth],
    create: [() => { throw new BadRequest('You are not allowed to create a notification type') }],
    update: [() => { throw new BadRequest('You are not allowed to update a notification type') }],
    patch: [() => { throw new BadRequest('You are not allowed to update a notification type') }],
    remove: [() => { throw new BadRequest('You are not allowed to delete a notification type') }],
  },

};
