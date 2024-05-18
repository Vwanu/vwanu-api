import { disallow } from 'feathers-hooks-common';
import * as feathersAuthentication from '@feathersjs/authentication';

import AutoOwn from '../../Hooks/AutoOwn'

const { authenticate } = feathersAuthentication.hooks;
const notAllow = disallow('external');


export default {
  before: {
    get: notAllow,
    create: [authenticate('jwt'), AutoOwn],
    update: notAllow,// only his own phone number 
    patch: notAllow,// only his own phone number 
    remove: notAllow,// only his own phone number 
  },
};
