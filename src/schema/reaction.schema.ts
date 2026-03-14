import { z, object, string, TypeOf } from 'zod';

const ReactionOptionalParams = ['AlbumPhotoId', 'PostId'];

export const createPostReactionSchema = z.object({
  body: object({
    PostId: z
      .number({ error: 'please provide a post id' })
      .or(string().regex(/\d+/).transform(Number)),
    UserId: z
      .number({ error: 'please provide a post id' })
      .or(string().regex(/\d+/).transform(Number)),
    content: z.string({ error: 'please specified which reaction' }),
  }),
});

export const getReactionSchema = z.object({
  params: object({
    id: z
      .number({
        error:
          'Please provide a reaction id for the reaction you are looking for',
      })
      .or(string().regex(/\d+/).transform(Number)),
  }),
});

export const editReactionSchema = z.object({
  params: object({
    id: z
      .number({
        error:
          'Please provide a reaction id for the reaction you are looking for',
      })
      .or(string().regex(/\d+/).transform(Number)),
  }),

  body: z.object({
    content: z.string({ error: 'You must provide a new content' }),
  }),
});
export const createReactionSchema = z.object({
  body: object({
    name: string({
      error: 'you cannot create an empty reaction',
    }),
    PostId: z
      .number({ error: 'Please provide an id' })
      .or(z.string().regex(/\d+/).transform(Number))
      .optional(),
    AlbumPhotoId: z
      .number({ error: 'Please provide an id' })
      .or(z.string().regex(/\d+/).transform(Number))
      .optional(),
  }).refine(
    (data) =>
      ReactionOptionalParams.some((item) => {
        if (
          data[item] !== null &&
          data[item] !== undefined &&
          data[item] !== ''
        )
          return true;
        return false;
      }),

    {
      message: `Please pass at least either ${ReactionOptionalParams.join(
        ' or '
      )}`,
    }
  ),
});

export type createPostReactionInput = TypeOf<
  typeof createPostReactionSchema
>['body'];
export type createReactionInput = TypeOf<typeof createReactionSchema>;
export type getReactionInput = TypeOf<typeof getReactionSchema>['params'];
export type editReactionInput = TypeOf<typeof editReactionSchema>;
