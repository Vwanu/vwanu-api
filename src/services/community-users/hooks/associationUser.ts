import { User } from '../../../database/user';
import addAssociation from '../../../Hooks/AddAssociations';
import { CommunityRole } from '../../../database/communityRole.model';

const attributes = [
'firstName',
'lastName',
'id',
'profilePicture',
'createdAt'];

export default addAssociation({
        models: [
          {
            model: User,
            attributes
          },
          {
            model: CommunityRole,
            attributes: ['name', 'id'],
          },
        ],
      });