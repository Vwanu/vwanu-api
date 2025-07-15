/* eslint-disable no-unused-vars */
import { Params, Id } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
// import { BadRequest } from '@feathersjs/errors';
import { Application } from '../../declarations';

// eslint-disable-next-line import/prefer-default-export
export class Users extends Service {
  app: Application;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async get(id: Id, params: Params) {
    console.log('--------------------------------');
    console.log('get', id, params);
    console.log('--------------------------------');
    const idString = id.toString();
    // if (idString === '1') {
    //   // console.log('Id 1 params', params);
    //   // if (!params.cognitoUser?.attributes?.sub) {
    //   //   throw new BadRequest('You need to be logged in to get your profile');
    //   // }
    //   // console.log('Id 1 params.cognitoUser', params.cognitoUser);
    //   const existingUser = await this.app
    //     .get('sequelizeClient')
    //     .models.User.findOne({
    //       where: { id: params.cognitoUser.id },
    //     });

    //   if (existingUser) {
    //     return Promise.resolve(existingUser);
    //   }
    //   // Create new user from Cognito details
    //   const newUser = await super.create({
    //     ...params.cognitoUser,
    //     nextCompletionStep: 1,
    //   });

    //   return Promise.resolve(newUser);
    // }
    if (idString === params.cognitoUser.id) {
  await this
    .app.get('sequelizeClient')
    .models.User
    .findOrCreate({ 
      where: { id: idString },
      defaults: {
        ...params.cognitoUser,
        nextCompletionStep: 1,
      },
    });
    }
    // return Promise.resolve(user);
    return super.get(id, params);
  }
}
