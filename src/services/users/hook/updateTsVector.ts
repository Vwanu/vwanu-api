import { HookContext } from '@feathersjs/feathers';

import updateTheTSVector from '../../search/tsquery-and-search.hook';

import { User } from '../../../database/user';

export default (ctx: HookContext) => {
  updateTheTSVector({
    model: User,
    searchColumn: 'search_vector',
  });
};
