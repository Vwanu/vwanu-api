import { object, string } from 'zod';

const createCommunityJoinSchema = object({
  body: object({
    CommunityId: string({
      error: (iss) => iss.input === undefined ? 'You need to provide a community id' : 'Please provide a valid community id',
    }),
  }),
});

export default createCommunityJoinSchema;
