// Initializes the `interests` service on path `/interests`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Interests } from './interests.class';
import interestHook from './interests.hooks';
import { Interest } from '../../database/interest';
import { Discussion } from '../discussions/discussions.class';
import discussionHooks from '../discussions/discussions.hooks';

declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    interests: Interests & ServiceAddons<Interest>;
    ['interests/:interestId/discussion']: Discussion & ServiceAddons<Discussion>;

  }
}

export default function (app: Application): void {
  const interestServiceOptions = {
    Model: Interest,
    // paginate: app.get('paginate'),
  };

  const discussionServiceOptions = {
    Model : Discussion,
    paginate : app.get('paginate')
}

  // Initialize our service with any options it requires
  app.use('/interests', new Interests(interestServiceOptions, app));
  app.use('/interests/:interestId/discussion', new Discussion(discussionServiceOptions, app));
hooks
  app.service('interests').hooks(interestHook);
  app.service('interests/:interestId/discussion').hooks(discussionHooks);
}
