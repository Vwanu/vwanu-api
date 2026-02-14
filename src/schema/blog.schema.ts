import { z, object, string } from 'zod';

export const BlogSchema = z.object({
  id: z.uuidv4(),
  content: string(),
  title: string(),
  titlePicture: string(),
  slug: string(),
  amountOfLikes: z.number(),
  amountOfComments: z.number(),
  publishedAt: z.iso.date(),
  createdAt: z.iso.date(),
  updatedAt:z.iso.date(),
  search_vector: z.string(),
});

export const createBlogSchema = object({
  body: object({
    content: string({
        error: (iss) => iss.input === undefined
         ? "Please provide content for your blog."
         : "You' have not provided recognizable text"}).min(10),
    title: string({
      error: (iss) => iss.input === undefined
      ? 'Please provide a title for your blog'
      : "You' have not provided recognizable text",
    }).min(1),

    titlePicture: string().optional(),
    publishAt: z.boolean().optional(),
  }),
});

const mustHaveEditBlog = ['content', 'title', 'titlePicture'];
export type Blog = z.infer<typeof BlogSchema>;
export const editBlogSchema = object({
  body: object({
    content: string().optional(),
    tittle: string().optional(),
    titlePicture: string().optional(),
    publishedAt: z.boolean().optional(),
  }).refine(
    (data) =>
      mustHaveEditBlog.some((item) => {
        if (
          data[item] !== null &&
          data[item] !== undefined &&
          data[item] !== ''
        )
          return true;
        return false;
      }),

    {
      message: `Please provided either ${mustHaveEditBlog.join(
        ' or '
      )} to update`,
    }
  ),
});
