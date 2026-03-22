// Initializes the `interests` service on path `/interests`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Interests } from './interests.class';
import interestHook from './interests.hooks';
import { Interest } from '../../database/interest';
import { Discussion } from '../discussion/discussion.class';
import { ForumDiscussion as DiscussionModel } from '../../database/forumDiscussion';
import discussionHooks from '../discussion/discussion.hooks';
import { DiscussionKore } from "../discussion-kore/discussion-kore.class";
import discussionKoreHooks from '../discussion-kore/discussion-kore.hooks';

declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    interests: Interests & ServiceAddons<any>;
    ['interests/:interestId/discussion']: Discussion & ServiceAddons<any>;
    ['interests/:interestId/discussion-kore']: DiscussionKore & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const interestServiceOptions = {
    Model: Interest,
    // paginate: app.get('paginate'),
  };

  const discussionServiceOptions = {
    Model : DiscussionModel,
    paginate : app.get('paginate')
}

  // Initialize our service with any options it requires
  app.use('/interests', new Interests(interestServiceOptions, app));
  app.use('/interests/:interestId/discussion', new Discussion(discussionServiceOptions, app));
  app.use('/interests/:interestId/discussion-kore', new DiscussionKore(discussionServiceOptions, app));

  app.service('interests').hooks(interestHook);
  app.service('interests/:interestId/discussion').hooks(discussionHooks);
  app.service('interests/:interestId/discussion-kore').hooks(discussionKoreHooks);
}
