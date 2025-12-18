import { AddAssociations } from '../../../Hooks';
import { User } from '../../../database/user';
import { CommunityRole } from '../../../database/communityRole.model';

const attributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];
const IncludeGuests = AddAssociations({
  models: [
    {
      model: User,
      as: 'guest',
      attributes,
    },

    {
      model: User,
      as: 'host',
      attributes,
    },
    {
      model: CommunityRole,
      as: 'communityRole',
    },
  ],
});

export default IncludeGuests;