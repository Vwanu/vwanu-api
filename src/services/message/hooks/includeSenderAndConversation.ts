import { AddAssociations } from '../../../Hooks';
import { User } from '../../../database/user';
import { Conversation } from '../../../database/conversation';
import { Media } from '../../../database/media';

const IncludeSenderAndConversation = AddAssociations({
  models: [
    {
      model: User,
      as: 'sender',
      attributes: [
        'firstName',
        'lastName',
        'id',
        'profilePicture',
        'createdAt',
      ],
    },
    { model: Conversation },
    { model: Media },
  ],
});

export default IncludeSenderAndConversation;
