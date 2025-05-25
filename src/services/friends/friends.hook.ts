
import { disallow } from 'feathers-hooks-common';

import notify from './hooks/notify';




const notAllowed = disallow();
export default {
  before: {
 
    get: notAllowed,
    update: notAllowed,
  },
  after: {
    create: notify,
  },
};
