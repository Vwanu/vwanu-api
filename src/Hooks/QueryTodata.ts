import { HookContext } from "@feathersjs/feathers";


export default (context: HookContext) :HookContext=> {

    const { query } = context.params ?? {};
    if(!query){
        return context;
    }
    Object.keys(query).forEach(key => {
        context.data[key] = query[key];
    });
    return context;
}
