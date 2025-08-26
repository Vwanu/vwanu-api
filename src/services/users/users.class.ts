/* eslint-disable no-unused-vars */
// import { Params, Id } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';


export class Users extends Service {
  app: Application;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

//   async create(
//     data: { email: string; password: string; firstName?: string; lastName?: string },
//     _params: Params,
//   ): Promise<AdminCreateUserCommandOutput> {
//     const { email, password, firstName, lastName } = data;  
  
//     console.log('Initializing cognito');
//     const authManager = AuthManager.getInstance();
//     // Ensure initialized (requireLogin would normally do this)
//     if (!process.env.userPoolId || !process.env.clientId) {
//       throw new Error('Cognito configuration is not set');
//     }
//     authManager.initialize({
//       userPoolId: process.env.userPoolId,
//       clientId: process.env.clientId,
//     });
//     console.log('Initializing cognito done');

//   try {
//     const cognitoResult = await authManager.createCognitoUser({
//     email,
//     password,
//     firstName,
//     lastName,
//   });
//   console.log('cognitoResult', cognitoResult);
//   return super.create({
//     email,
//     firstName: firstName ?? 'Not specified',
//     lastName: lastName ?? 'Not specified',
//     verified: true,
//     id: cognitoResult.UserSub,
//   } as Partial<UserModel> & Record<string, unknown>);

//   // return cognitoResult;
// } catch (error) {
//   console.log('Error in create', error);
//   throw error;
// }

   

//     // Persist minimal user to DB via the adapter service
    
//   }
  // async get(id: Id, params: Params) {
  //   console.log('--------------------------------');
  //   console.log('get', id, params);
  //   console.log('--------------------------------');
  //   const idString = id.toString();
  //   // if (idString === '1') {
  //   //   // console.log('Id 1 params', params);
  //   //   // if (!params.cognitoUser?.attributes?.sub) {
  //   //   //   throw new BadRequest('You need to be logged in to get your profile');
  //   //   // }
  //   //   // console.log('Id 1 params.cognitoUser', params.cognitoUser);
  //   //   const existingUser = await this.app
  //   //     .get('sequelizeClient')
  //   //     .models.User.findOne({
  //   //       where: { id: params.cognitoUser.id },
  //   //     });

  //   //   if (existingUser) {
  //   //     return Promise.resolve(existingUser);
  //   //   }
  //   //   // Create new user from Cognito details
  //   //   const newUser = await super.create({
  //   //     ...params.cognitoUser,
  //   //     nextCompletionStep: 1,
  //   //   });

  //   //   return Promise.resolve(newUser);
  //   // }
  //   if (idString === params.cognitoUser.id) {
  //     // @ts-ignore`
  //     await this.app.get('sequelizeClient').model('User').findOrCreate({ 
  //       where: { id: idString },
  //       defaults: {
  //         ...params.cognitoUser,
  //         nextCompletionStep: 1,
  //       },
  //     });
  //   }
  //   // return Promise.resolve(user);
  //   return super.get(id, params);
  // }
}
