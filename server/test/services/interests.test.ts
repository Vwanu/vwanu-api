import random from 'lodash/random';
import { randomBytes } from 'crypto';

describe("'interests' service", () => {

  let testUsers;
  let interests: any[];
  let adminUser;
  const endpoint = '/interests';

  beforeAll(async () => {
    testUsers = await global.__getRandUsers(2);
    // adminUser = await global.__getAdminUsers(1);
  }, 10000);


  it.skip('registered the service', () => {
    const service = global.__APP__.service('interests');
    expect(service).toBeTruthy();
  });

  /** CRUD  */

  it.skip('Anyone can create new interests but are not aproved', async () => {

    interests = await Promise.all(
      testUsers.map((user, idx) =>
        global.__SERVER__
          .post(endpoint)
          .send({ name: randomBytes(random(+idx, 10)).toString('hex') })
          .set('authorization', user.accessToken)
      )
    );

    interests = interests.map((interest) => interest.body);



    interests.forEach((interest) => {
      expect(interest).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        approved: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

  });

  it.skip('Only admin can edit interest', async () => {
    const noneApprovedInterest = interests[0];
    const noneAdminUser = testUsers[0];



    const modifiedInterests = await Promise.all(
      [noneAdminUser, adminUser[0]].map((user) =>
        global.__SERVER__
          .patch(`${endpoint}/${noneApprovedInterest.id}`)
          .send({ name: 'new interest' })
          .set('authorization', user.accessToken)
      )
    );

    const [firstAttempt, secondAttempt] = modifiedInterests.map(({ body }) => body);


    expect(firstAttempt).toMatchObject({
      name: 'BadRequest',
      message: 'You are not authorized to modify interest',
      code: 400,
      className: 'bad-request',
      errors: {},
    });



    expect(secondAttempt).toMatchObject({
      id: noneApprovedInterest.id,
      name: 'new interest',
      approved: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
  it.skip('Approved interest cannot be modified', async () => {

    const approvedInterest = interests[1];

    const modifyApprovedInterest = await global.__SERVER__
      .patch(`${endpoint}/${approvedInterest.id}`)
      .send({ name: 'new interest' })
      .set('authorization', adminUser.accessToken);

    expect(modifyApprovedInterest.body).toMatchObject({
      name: 'BadRequest',
      message: 'Approved interest cannot be modified',
      code: 400,
      className: 'bad-request',
      errors: {},
    });
  });

  it.skip('Everyone can see all approved interest only', async () => {
    const allInterests: any = await global.__SERVER__.get(endpoint);

    allInterests.body.forEach((interest) => {
      expect(interest).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        approved: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
  it.skip('Only admin can delete interest', async () => {
    const noneApprovedInterest = interests[0];
    const noneAdminUser = testUsers[0];

    let deletedInterests = await Promise.all(
      [noneAdminUser, adminUser].map((user) =>
        global.__SERVER__
          .delete(`${endpoint}/${noneApprovedInterest.id}`)
          .set('authorization', user.accessToken)
      )
    );

    deletedInterests = deletedInterests.map(({ body }) => body);

    const firstAttempt = deletedInterests[0];
    expect(firstAttempt).toMatchObject({
      name: 'BadRequest',
      message: 'You are not authorized to delete interest',
      code: 400,
      className: 'bad-request',
      errors: {},
    });

    const secondAttempt = deletedInterests[1];
    expect(secondAttempt).toMatchObject({
      id: noneApprovedInterest.id,
      name: 'new interest',
      approved: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it.skip('Approved interest cannot be deleted', async () => {
    /** Cannot delete approved interests */

    const ApprovedInterest = interests[1]; // this was created by and admin
    const deleteResponse = await global.__SERVER__
      .delete(`${endpoint}/${ApprovedInterest.id}`)
      .set('authorization', adminUser.accessToken);

    expect(deleteResponse.body).toMatchObject({
      name: 'BadRequest',
      message: 'Approved interest cannot be deleted',
      code: 400,
      className: 'bad-request',
      errors: {},
    });
  });
});
