/* eslint-disable no-unused-vars */
// Initializes the `communities ` service on path `/communities`
import { ServiceAddons } from '@feathersjs/feathers';

import hooks from './communities.hooks';
import { Application } from '../../declarations';
import { Communities } from './communities.class';
import { Community } from '../../database/communities';
import { CommunityUser } from '../../database/community-users';
import {CommunityInvitationRequest as InvitationModel} from '../../database/communityInvitationRequest';
import { postStorage as profilesStorage } from '../../storage/s3';
import updateTheTSVector from '../search/tsquery-and-search.hook';
import {CommunityUsers} from '../community-users/community-users.class'
import communityUsersHooks from '../community-users/community-users.hooks'
import {CommunityInvitationRequest  } from '../community-invitation-request/community-invitation-request.class'
import communityInvitationRequestHooks from '../community-invitation-request/community-invitation-request.hooks'
import fileToFeathers from '../../middleware/PassFilesToFeathers/file-to-feathers.middleware';


declare module '../../declarations' {
  interface ServiceTypes {
    communities: Communities & ServiceAddons<Communities>;
    ['communities/:communityId/members']:CommunityUsers & ServiceAddons<CommunityUsers>;
    ['communities/:communityId/invitations']:CommunityInvitationRequest & ServiceAddons<CommunityInvitationRequest>;
  }
}

export default function (app: Application): void {

  const communityOptions = {
    Model: Community,
    paginate: app.get('paginate'),
  };

  const communityUsersOptions ={
    Model:CommunityUser, 
    paginate:app.get('paginate')
  }

  const communityInvitationRequestOptions ={
    Model:InvitationModel, 
    paginate:app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use(
    '/communities',
    profilesStorage.fields([
      { name: 'profilePicture', maxCount: 1 },
      { name: 'coverPicture', maxCount: 1 },
    ]),
    fileToFeathers,
    new Communities(communityOptions, app)
  );

  app.use('/communities/:communityId/members', new CommunityUsers(communityUsersOptions, app))
  app.use('/communities/:communityId/invitations', new CommunityInvitationRequest(communityInvitationRequestOptions, app))
  
  app.service('communities/:communityId/members').hooks(communityUsersHooks)
  app.service('communities/:communityId/invitations').hooks(communityInvitationRequestHooks)
  
  const service = app.service('communities');

  service.hooks({
    before: { ...hooks.before },
    after: {
      ...hooks.after,
      create: [
        ...hooks.after.create,
        updateTheTSVector({
          model: Community,
          searchColumn: 'search_vector',
        }),
      ],
      update: [
        updateTheTSVector({
          model: Community,
          searchColumn: 'search_vector',
        }),
      ],
      patch: [
        updateTheTSVector({
          model: Community,
          searchColumn: 'search_vector',
        }),
      ],
    },
  });


}
