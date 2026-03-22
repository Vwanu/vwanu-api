import { HookContext } from '@feathersjs/feathers';

export default async (context: HookContext) => {
    console.log('❤️‼️AdjustAmountOfReplies hook - context:', context);
    const { method, result, app } = context;
    const parentId = result?.parentId;
    if (!parentId) return context;

    try {
        const ForumDiscussion = app.get('sequelizeClient').models.ForumDiscussion;
        const parent = await ForumDiscussion.findByPk(parentId);
        if (!parent) return context;

        const newCount = method === 'create'
            ? (parent.amountOfReplies || 0) + 1
            : method === 'remove'
            ? Math.max((parent.amountOfReplies || 1) - 1, 0)
            : parent.amountOfReplies;

        await parent.update({ amountOfReplies: newCount });
    } catch (error) {
        console.error('Error updating amountOfReplies on parent discussion:');
        // @ts-ignore
        console.error(error.message);
    }

    return context;
};
