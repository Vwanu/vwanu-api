import {  AddAssociations, AutoOwn, NestedPath } from '../../Hooks';
import AdjustAmountOfReplies from './hooks/adjustAmountOfReplies';
import AddIsReactor from './hooks/addIsReactor';

import { User } from '../../database/user';


const UserAttributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];

const ParseNullQuery = (context) => {
 if (context.params.query?.parentId === 'null') {
      context.params.query.parentId = null;
    }
return context; };
const JoinCreator = AddAssociations({
  models: [
    {
      model: User,
      as: 'user',
      attributes: UserAttributes,
    },
  ],
});

export default {
    before: {
        all: [JoinCreator],
        find: [ParseNullQuery, AddIsReactor],
        get: [AddIsReactor],
        create: [
            AutoOwn, NestedPath],
    },
    after: {
        create: [AdjustAmountOfReplies],
        remove: [AdjustAmountOfReplies],
    }
};
