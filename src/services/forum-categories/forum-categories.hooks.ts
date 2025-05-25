import { disallow } from 'feathers-hooks-common';
import OrderBy from '../../Hooks/OrderBy.hooks';
// Don't remove this comment. It's needed to format import lines nicely.





export default {
  before: {
 
    find: [OrderBy({ name: 1 })],
    update: disallow('external'),
  },
};
