
// import { Params, Id } from '@feathersjs/feathers';
// import { BadRequest, NotFound } from '@feathersjs/errors';
import { Service } from 'feathers-sequelize';
import { Application } from '../../declarations';


export class CommunityBans extends Service {
  app: Application;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options, app: Application) {
    super(options);
    this.app = app;
  }

//   async create(data: any, params: Params) {
//     const { userId, communityId, comment, until } = data;
//     const sequelize = this.app.get('sequelizeClient');

//     try {
//       await sequelize.query(
//         `call insert_community_ban(:userId,:communityId,:by_user_id,:comment, :until )`,
//         {
//           replacements: {
//             userId,
//             communityId,
//             by_user_id: params.User.id,
//             comment: comment || '',
//             until: until || null,
//           },
//         }
//       );
//       return Promise.resolve({ message: 'Ban created' });
//     } catch (err: unknown | any) {
//       const fallback = 'Could not create ban';
//       throw new BadRequest(err || fallback);
//     }
//   }

//   async remove(id: Id, params: Params) {
//     const sequelize = this.app.get('sequelizeClient');
//     const { CommunityBans } = sequelize.models;

//     const ban = await CommunityBans.findOne({
//       where: {
//         userId: id,
//         communityId: params.query.communityId,
//       },
//     });

//     if (!ban) {
//       throw new NotFound('Ban record not found');
//     }

//     await ban.destroy();
//     return { message: 'User has been unbanned' };
//   }
}
