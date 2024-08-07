import * as feathersAuthentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';

import notify from './hooks/notify';
import AgeAllow from '../../Hooks/AgeAllow';
import getFriends from './hooks/getFriends';

const { authenticate } = feathersAuthentication.hooks;

const notAllowed = disallow();
export default {
  before: {
    all: [authenticate('jwt'), AgeAllow],
    get: notAllowed,
    update: notAllowed,
    find: getFriends,
  },
  after: {
    create: notify,
  },
};
