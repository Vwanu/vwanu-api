import { z, object, string } from 'zod';


// eslint-disable-next-line import/prefer-default-export
export const createBanSchema = object({
  body: object({
    userId: string({
      error: (iss) => iss.input === undefined ? 'You have not provided the user id' : 'It must be a valid user id',
    }),
    communityId: string({
      error: (iss) => iss.input === undefined ? 'You have not provided the community id' : 'It must be a valid community id',
    }),
    comment: string().optional(),
    until: z.date().optional(),
  }),
});
