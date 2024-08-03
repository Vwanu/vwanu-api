import commonHooks from 'feathers-hooks-common';
import * as local from '@feathersjs/authentication-local';
import * as feathersAuthentication from '@feathersjs/authentication';

import * as schema from '../../schema/user';
import isSelf from '../../Hooks/isSelf.hook';
import AutoLogin from '../../Hooks/AutoLoginHooks';
import validateResource from '../../middleware/validateResource';
import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';
import MediaStringToMediaObject from '../../Hooks/ProfileCoverToObject';
import filesToBody from '../../middleware/PassFilesToFeathers/feathers-to-data.middleware';

import {
  SaveAddress,
  AssignRole,
  AddVisitor,
  GetUser,
  SendWelcomeMail /* SendEmail */,
  AddworkPlace,
  IncludeAddress
} from './hook';
import SaveAndAttachInterests from '../../Hooks/SaveAndAttachInterest';
import { HookContext } from '../../app';



const { hashPassword, protect } = local.hooks;
const { authenticate } = feathersAuthentication.hooks;

const protectkeys = protect(
  ...[
    'password',
    'verifyToken',
    'resetToken',
    'resetShortToken',
    'resetExpires',
    'verifyShortToken',
    'activationKey',
    'resetPasswordKey',
    'verifyExpires',
    'search_vector',
  ]
);

const sanitizeUser = (context: HookContext) => {
  const genderType = typeof context.data.gender
  if (genderType === 'boolean') return context;

  if (genderType === 'string')
    if (context.data.gender.toLowerCase === 'm')
      context.data.gender = true;
    else context.data.gender = false;

  return context;

};
export default {
  before: {
    find: [authenticate('jwt'), GetUser],
    get: [authenticate('jwt'), GetUser],
    create: [
      sanitizeUser,


      validateResource(schema.createUserSchema),
      saveProfilePicture(['profilePicture', 'coverPicture']),
      filesToBody,
      hashPassword('password'),

    ],
    update: [commonHooks.disallow('external')],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(
          true,

          ...[
            'email',
            'isVerified',
            'verifyToken',
            'verifyShortToken',
            'verifyExpires',
            'verifyChanges',
            'resetToken',
            'resetShortToken',
            'resetExpires',
            'activationKey',
            'resetPasswordKey',
            'password',
          ]
        ),

        authenticate('jwt'),
        isSelf
      ),
      hashPassword('password'),
      saveProfilePicture(['profilePicture', 'coverPicture']),
    ],
    remove: [authenticate('jwt'), isSelf],
  },

  after: {
    all: [MediaStringToMediaObject(['profilePicture', 'coverPicture'])],
    find: [protectkeys],
    get: [AddVisitor, protectkeys],
    create: [

      SaveAddress,
      AutoLogin,
      AddworkPlace,
      // IncludeAddress,
      SaveAndAttachInterests({
        entityName: 'User',
        relationTableName: 'User_Interest',
        foreignKey: 'UserId',
        otherKey: 'InterestId'
      }),
      // SendWelcomeMail,
      protectkeys,
    ],
    patch: [
      SaveAddress,
      AddworkPlace,
      SaveAndAttachInterests({
        entityName: 'User',
        relationTableName: 'User_Interest',
        foreignKey: 'UserId',
        otherKey: 'InterestId'
      }),
      protectkeys,
    ],
    remove: [protectkeys],
  },
};
