
import { AddAssociations } from '../../../Hooks';

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
      model: 'users',
      as: 'guest',
      attributes,
    },

    {
      model: 'users',
      as: 'host',
      attributes,
    },
    {
      model: 'community-role',
    },
  ],
});

export default IncludeGuests;