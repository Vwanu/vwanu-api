import { HookContext } from '@feathersjs/feathers';

import updateTheTSVector from '../../search/tsquery-and-search.hook';
import { Application } from '../../../declarations';

export default (ctx: HookContext) => {
  const app = ctx.app as Application;
  updateTheTSVector({
    model: app.get('sequelizeClient').models.User,
    searchColumn: 'search_vector',
  });
};
