import request from 'supertest';
import Sequelize from 'sequelize';

import app from '../src/app';
import { IMessenger } from '../src/schema/email.schema';
import { getRandUsers } from '../src/lib/utils/generateFakeUser';



class MockMessenger implements IMessenger {
  constructor() {

  }
  // @ts-ignore
  sendTemplate = jest.fn().mockResolvedValue({ ok: true });
  // @ts-ignore
  send = jest.fn().mockResolvedValue({ ok: true });
}

// @ts-ignore
jest.mock('../src/lib/utils/outReach', () => ({
  __esModule: true,
  EmailerService: () => new MockMessenger(),
}));

global.__APP__ = app;
global.__SEQUELIZE__ = app.get('sequelizeClient')
global.__SERVER__ = request(app);
global.__getRandUsers = async (amount: number = 1) => {
  const users = await Promise.all(
    getRandUsers(amount).map((user) => global.__SERVER__.post('/users').send({ ...user, id: undefined })
    ));

  return users.map((testUser) => testUser.body);

}

global.__cleanup = async (modelName: string, id: string | string[]) => {
  const model = global.__SEQUELIZE__.models[modelName];
  const ids = Array.isArray(id) ? id : [id];
  await model.destroy({ where: { id: { [Sequelize.Op.in]: ids } } });
}


global.__getAdminUsers = async (amount: number = 1) => {
  const users = await global.__getRandUsers(amount);
  const { CommunityRoles, User } = global.__SEQUELIZE__.models;
  const adminRole = await CommunityRoles
    .findOne({ where: { name: 'admin' } });

  const ids = users.map((user) => user.id);


  try {
    await User
      .update(
        { access_role: adminRole.id },
        { where: { id: { [Sequelize.Op.in]: ids } } }
      );

  } catch (error) {
    console.log('error', error);
  }
  return users;
}




