import { disallow } from 'feathers-hooks-common';
import OrderBy from '../../Hooks/OrderBy.hooks';
// Don't remove this comment. It's needed to format import lines nicely.
import AgeAllow from '../../Hooks/AgeAllow';
import { requireAuth } from '../../Hooks/requireAuth';



export default {
  before: {
    all: [requireAuth, AgeAllow],
    find: [OrderBy({ name: 1 })],
    update: disallow('external'),
  },
};
