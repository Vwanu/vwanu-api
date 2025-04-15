import { requireAuth } from '../../Hooks/requireAuth';
import { disallow } from 'feathers-hooks-common';

import notify from './hooks/notify';
import AgeAllow from '../../Hooks/AgeAllow';



const notAllowed = disallow();
export default {
  before: {
    all: [requireAuth, AgeAllow],
    get: notAllowed,
    update: notAllowed,
  },
  after: {
    create: notify,
  },
};
