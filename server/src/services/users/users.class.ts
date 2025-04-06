/* eslint-disable no-unused-vars */
import { Params, Id } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { BadRequest } from '@feathersjs/errors';
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
    const idString = id.toString();
    if (idString === '1') {
      if (!params.cognitoUser?.attributes?.sub) {
        throw new BadRequest('You need to be logged in to get your profile');
      }

      const existingUser = await this.app
        .get('sequelizeClient')
        .models.User.findOne({
          where: { id: params.cognitoUser.attributes.sub },
        });

      if (existingUser) {
        return Promise.resolve(existingUser);
      }
      // Create new user from Cognito details
      const newUser = await super.create({
        id: params.cognitoUser.attributes.sub,
        email: params.cognitoUser.attributes.email,
        firstName: params.cognitoUser.attributes.given_name,
        lastName: params.cognitoUser.attributes.family_name,
        nextCompletionStep: 1,
        emailVerified: params.cognitoUser.attributes.email_verified === 'true',
      });

      return Promise.resolve(newUser);
    }
    return super.get(id, params);
  }
}
