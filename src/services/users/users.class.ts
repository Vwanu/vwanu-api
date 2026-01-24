/* eslint-disable no-unused-vars */
// import { Params, Id } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Params } from '@feathersjs/feathers';
// @ts-ignore
import { Op, Sequelize } from 'sequelize';

export class Users extends Service {
  app: Application;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async find(params: Params): Promise<any> {
    const query = params?.query || {};

    if (query.search) {
      console.log('Users service find method received search query:', query.search);
      const searchTerm = query.search.trim();
      delete query.search;

      // Add :* suffix to each term for prefix matching (allows partial matches like "wad" for "wadson")
      const tsqueryTerm = searchTerm.split(/\s+/).map(term => term + ':*').join(' & ');

      // Use PostgreSQL full-text search with @@ operator
      query[Op.and] = Sequelize.where(
        Sequelize.col('search_vector'),
        '@@',
        Sequelize.fn('to_tsquery', 'english', tsqueryTerm)
      );
    }

    params.query = query;

    const results = await super.find(params);
    return results;
  }
}
