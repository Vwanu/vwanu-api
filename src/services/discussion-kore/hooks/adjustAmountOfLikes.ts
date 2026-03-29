import { HookContext } from '@feathersjs/feathers';

export default async (context: HookContext) => {
    const { result, app } = context;
    const discussionId = result?.discussionId;
    console.log('AdjustAmountOfLikes hook called with discussionId:', discussionId);
    if (!discussionId) return context;

    try {
        const { ForumDiscussion, Korem } = app.get('sequelizeClient').models;

        const discussion = await ForumDiscussion.findByPk(discussionId);
        if (!discussion) return context;

        const likeCount = await Korem.count({
            where: {
                entityId: discussionId,
                entityType: 'Discussion',
            },
        });

        await discussion.update({ amountOfLikes: likeCount });
    } catch (error) {
        console.error('Error updating amountOfLikes on discussion:');
        // @ts-ignore
        console.error(error.message);
    }

    return context;
};
