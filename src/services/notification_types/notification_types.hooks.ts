import { BadRequest } from '@feathersjs/errors';



export default {
  before: {
    all: [],
    get: [],
    find: [],
    create: [() => { throw new BadRequest('You are not allowed to create a notification type') }],
    update: [() => { throw new BadRequest('You are not allowed to update a notification type') }],
    patch: [() => { throw new BadRequest('You are not allowed to update a notification type') }],
    remove: [() => { throw new BadRequest('You are not allowed to delete a notification type') }],
  },

};
