import { disallow } from 'feathers-hooks-common';
import * as feathersAuthentication from '@feathersjs/authentication';


const { authenticate } = feathersAuthentication.hooks;
const notAllow = disallow('external');

export default {
  before: {
    get: notAllow,
    create: authenticate('jwt'),
    update: notAllow,
    patch: notAllow,
    remove: notAllow,
  },
};
