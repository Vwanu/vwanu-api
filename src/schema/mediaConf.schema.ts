import { z, object } from 'zod';

export const CLOUDINARY_CONFIG_SCHEMA = object({
  api_secret: z.string({
    error: (iss) => iss.input === undefined ? 'Cloudinary API secret is required' : 'Cloudinary API secret must be a string',
  }),
  api_key: z.string({
    error: (iss) => iss.input === undefined ? 'Cloudinary API key is required' : 'Cloudinary API key must be a string',
  }),
  cloud_name: z.string({
    error: (iss) => iss.input === undefined ? 'Cloudinary cloud name is required' : 'Cloudinary cloud name must be a string',
  }),
});

export const MEDIA_CONFIG_SCHEMA = object({
  maxPostVideos: z
    .number({
      error: (iss) => iss.input === undefined ? 'Please provide a valid number for max Post Videos ' : undefined,
    })
    .or(z.string().regex(/\d+/).transform(Number)),
  maxPostAudios: z
    .number({
      error: (iss) => iss.input === undefined ? 'Please provide a valid number for max Post Audios ' : undefined,
    })
    .or(z.string().regex(/\d+/).transform(Number)),
  maxPostImages: z
    .number({
      error: (iss) => iss.input === undefined ? 'Please provide a valid number for max Post Images ' : undefined,
    })
    .or(z.string().regex(/\d+/).transform(Number)),
  maxMessageImages: z
    .number({
      error: (iss) => iss.input === undefined ? 'Please provide a valid number for max Message Images ' : undefined,
    })
    .or(z.string().regex(/\d+/).transform(Number)),
  maxDiscussionVideos: z
    .number({
      error: (iss) => iss.input === undefined ? 'Please provide a valid number for max Discussion Videos ' : undefined,
    })
    .or(z.string().regex(/\d+/).transform(Number)),
  maxDiscussionAudios: z
    .number({
      error: (iss) => iss.input === undefined ? 'Please provide a valid number for max Discussion Audios ' : undefined,
    })
    .or(z.string().regex(/\d+/).transform(Number)),
  maxDiscussionImages: z
    .number({
      error: (iss) => iss.input === undefined ? 'Please provide a valid number for max Discussion Images ' : undefined,
    })
    .or(z.string().regex(/\d+/).transform(Number)),
});

export type MEDIA_CONFIG_TYPE = z.infer<typeof MEDIA_CONFIG_SCHEMA>;
export type CLOUDINARY_CONFIG_TYPE = z.infer<typeof CLOUDINARY_CONFIG_SCHEMA>;
