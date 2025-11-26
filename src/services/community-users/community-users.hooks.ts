import NestedPath from '../../Hooks/NestedPath';
import {disallow} from 'feathers-hooks-common';
import {associationUser, ownerOrAuthorized} from './hooks';

export default {
  before: {
    find: [NestedPath, associationUser],
    get: disallow(),
    create: disallow(),
    update: disallow(),
    patch: disallow(),
    remove: [ownerOrAuthorized],
  },

};
