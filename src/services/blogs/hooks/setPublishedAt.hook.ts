import { HookContext } from '@feathersjs/feathers';

/**
 * Interprets publishedAt as a boolean intent from the client:
 *   true  → set publishedAt to now
 *   false → clear publishedAt (unpublish)
 * Has no effect when publishedAt is not provided.
 */
const setPublishedAt = async (context: HookContext): Promise<HookContext> => {
  const { publishedAt } = context.data;

  if (!!publishedAt) {
    context.data.publishedAt = new Date();
  } else {
    context.data.publishedAt = null;
  }

  return context;
};

export default setPublishedAt;
