import { disallow } from 'feathers-hooks-common';


const notAllow = disallow('external');

export default {
  before: {
    create: notAllow,
    update: notAllow,
    remove: notAllow,
  },
};
