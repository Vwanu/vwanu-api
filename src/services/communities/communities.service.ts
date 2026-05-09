/* eslint-disable no-unused-vars */
// Initializes the `communities ` service on path `/communities`
import { ServiceAddons } from '@feathersjs/feathers';

import hooks from './communities.hooks';
import { Application } from '../../declarations';
import { Communities } from './communities.class';
import { Community } from '../../database/communities';
import { CommunityUser } from '../../database/community-users';
import { CommunityBan } from '../../database/community-bans';
import updateTheTSVector from '../search/tsquery-and-search.hook';
import communityJoinHooks from '../community-join/community-join.hooks'
import {CommunityUsers} from '../community-users/community-users.class'
import communityUsersHooks from '../community-users/community-users.hooks'
import {CommunityJoinRequest} from '../community-join/community-join.class'
import {CommunityBans} from '../community-bans/community-bans.class'
import communityBansHooks from '../community-bans/community-bans.hooks'
import {CommunityJoinRequest as CommunityJoinRequestModel} from '../../database/communityJoinRequest'
import {CommunityInvitationRequest as InvitationModel} from '../../database/communityInvitationRequest';
import {CommunityInvitationRequest  } from '../community-invitation-request/community-invitation-request.class'
import communityInvitationRequestHooks from '../community-invitation-request/community-invitation-request.hooks'


declare module '../../declarations' {
  interface ServiceTypes {
    communities: Communities & ServiceAddons<Communities>;
    ['communities/:communityId/members']:CommunityUsers & ServiceAddons<CommunityUsers>;
    ['communities/:communityId/joinRequest']:CommunityJoinRequest & ServiceAddons<CommunityJoinRequest>;
    ['communities/:communityId/invitations']:CommunityInvitationRequest & ServiceAddons<CommunityInvitationRequest>;
    ['communities/:communityId/bans']:CommunityBans & ServiceAddons<CommunityBans>;
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
    paginate:app.get('paginate'),
    multi: ['create'], // Allow bulk creation of invitation requests
  }

  const communityJoinOptions ={
    Model:CommunityJoinRequestModel,
    paginate:app.get('paginate')
  }

  const communityBansOptions ={
    Model:CommunityBan,
    paginate:app.get('paginate')
  }

  // Direct registration — no multer/multipart middleware. Profile/cover
  // pictures land via the presign flow handled by applyProfileMediaKeys
  // in communities.hooks.ts (clients send profilePictureKey/coverPictureKey
  // in the JSON body of POST/PATCH /communities).
  app.use('/communities', new Communities(communityOptions, app));

  app.use('/communities/:communityId/members', new CommunityUsers(communityUsersOptions, app))
  app.use('/communities/:communityId/joinRequest', new CommunityJoinRequest(communityJoinOptions, app))
  app.use('/communities/:communityId/invitations', (req, res, next)=>{
    console.log('🆘🫀Community Invitation Request Middleware');
    return next();
  },  new CommunityInvitationRequest(communityInvitationRequestOptions, app))
  app.use('/communities/:communityId/bans', new CommunityBans(communityBansOptions, app))

  app.service('communities/:communityId/members').hooks(communityUsersHooks)
  app.service('communities/:communityId/invitations').hooks(communityInvitationRequestHooks)
  app.service('communities/:communityId/joinRequest').hooks(communityJoinHooks)
  app.service('communities/:communityId/bans').hooks(communityBansHooks)

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
