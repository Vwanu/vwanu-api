import { HookContext } from '@feathersjs/feathers';

export default (context: HookContext): HookContext => {
  const { query = {} } = context.params;

  if (!query.response) 
    query.response = null;
  
  context.params.query = query;

  return context;
};
