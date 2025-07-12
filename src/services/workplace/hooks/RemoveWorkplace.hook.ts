import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import {createLogger} from '../../../lib/utils/logger';

const Logger = createLogger('RemoveWorkplace');

export default async (context: HookContext): Promise<HookContext> => {
  const { id, app, params } = context;

  try {
    const sequelizeClient = app.get('sequelizeClient');
    const { UserWorkPlace } = sequelizeClient.models;

    await UserWorkPlace.destroy({
      where: {
        UserId: params.cognitoUser?.id,
        WorkPlaceId: id,
      },
    });
    context.result = { message: 'Workplace removed' };
  } catch (err) {
    Logger.error('Error removing workplace', err);
    throw new BadRequest('Error removing workplace');
  }

  return context;
};
