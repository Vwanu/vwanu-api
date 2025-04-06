import { z, object, string, TypeOf } from 'zod';

export const createUserSchema = object({
  body: object({
    firstName: string({
      required_error: 'Please provide a first name',
    }),
    lastName: string({
      required_error: 'Please provide a last name',
    }),
    email: string({
      required_error: 'You must provide a valid email address',
    }).email('The email address you provided is not a valid email'),
  }),
});

export const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  verified: z.boolean(),
});


export const account = object({
  id: z.string(),
  // access_role: z.string(),
  email: z.string(),
  password: string(),
  firstName: string(),
  lastName: string(),
  profilePicture: string(),
  coverPicture: string(),
  about: string(),
  gender: string(),
  birthday: string(),
  search_vector: z.string(),
});
export const addOrRemoveFriendSchema = object({
  params: object({
    id: string(),
    friendId: string(),
  }),
  query: object({
    action: string(),
  }),
});


export const getUserSchema = object({
  params: object({
    id: string(),
  }),
});




export type UserInterface = z.infer<typeof UserSchema>;
export type UpUserInterface = z.infer<typeof account>;
export type CreateUserInput = TypeOf<typeof createUserSchema>;
export type GetUserInput = z.infer<typeof getUserSchema>['params'];
export type addOrRemoveFriendInput = TypeOf<typeof addOrRemoveFriendSchema>;
