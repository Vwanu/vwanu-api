import { ZodObject } from 'zod';
import { BadRequest } from '@feathersjs/errors';

const validateResource = (schema: ZodObject) => (context) => {
  try {
    schema.parse({
      body: context.data,
      query: context.params.query,
      params: context.path,
    });
    return context;
  } catch (error: any) {
    throw new BadRequest('Invalid Parameters', error);
  }
};

export default validateResource;
