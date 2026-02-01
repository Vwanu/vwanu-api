
import { HookContext } from '@feathersjs/feathers';

const refetch =  (serviceName: string) => async (context : HookContext) : Promise<HookContext> => {
    if(context.type !=='after')
        throw new Error('The refetch hook can only be used as an after hook');
    if(!context.result || !context.result.id)
        throw new Error('The refetch hook requires the context.result to have an id field');

    const service = context.app.service(serviceName);
    if(!service)
        throw new Error(`Service ${serviceName} not found in application`);

   context.result =  await service.get(context.result.id, context.params);

 return context;
};

export default refetch;
