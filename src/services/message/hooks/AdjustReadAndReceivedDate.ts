import { HookContext } from '@feathersjs/feathers';

const AdjustReadAndReceivedDate = async (context: HookContext) => {
    if(context.data.isRead){
        context.data.readDate=new Date();
        delete context.data.isRead;
    }else if(context.data.isDelivered){
        context.data.receivedDate=new Date();
        delete context.data.isDelivered;
    }
    return context
};

export default AdjustReadAndReceivedDate;
