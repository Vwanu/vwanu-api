import * as authentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';


import AgeAllow from '../../Hooks/AgeAllow';
import associateUser from './hooks/associateUser.hook';
import CompleteNotificationData from './hooks/notificationDataFiller.hook';
import OnlyAuthorized from '../../Hooks/OnlyAuthorized.hook';

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [],
    find: [authenticate('jwt'), AgeAllow, associateUser],
    get: [authenticate('jwt'), AgeAllow],
    create: [disallow('external'), CompleteNotificationData],
    update: [disallow()],
    patch: [OnlyAuthorized('ToUserId')],
    remove: [OnlyAuthorized('ToUserId')],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],// check the user setting and determing if text or email should be sent
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
