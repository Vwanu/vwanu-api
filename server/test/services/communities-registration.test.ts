import { randomBytes } from 'crypto';
import { StatusCodes } from 'http-status-codes';

const rolesEndpoint = '/community-role';
const communityEndpoint = '/communities';
const endpoint = '/communities-registrations';
const invitationEndpoint = '/community-invitation-request';

describe("'communities registration' service", () => {
  let roles;
  let testUsers;
  const testServer = global.__SERVER__;
  let communities;
  let invitations;
  let creator;

  beforeAll(async () => {

    testUsers = await global.__getRandUsers(5);
    const adminUser = testUsers.shift();
    creator = testUsers.shift();


    roles = await global
      .__SERVER__
      .get(rolesEndpoint)
      .set('authorization', adminUser.accessToken);
    roles = roles.body.data;



    communities = await Promise.all(
      ['private', 'public', 'hidden'].map((privacyType,) =>
        global.__SERVER__
          .post(communityEndpoint)
          .send({
            name: `${randomBytes(5).toString('hex')}`,
            privacyType,
            description: `${randomBytes(10).toString('hex')}`,
          })
          .set('authorization', creator.accessToken)
      )
    );

    communities = communities.map((community) => community.body);

    invitations = await Promise.all(
      testUsers.map((guest, idx) =>
        global.__SERVER__
          .post(invitationEndpoint)
          .send({
            guestId: guest.id,
            CommunityRoleId: roles[idx].id,
            CommunityId: communities[idx].id,
          })
          .set('authorization', creator.accessToken)
      )
    );

    invitations = invitations.map((invitation) => invitation.body);
  }, 100000);

  it('registered the service', () => {
    const service = global.__APP__.service('communities-registrations');
    expect(service).toBeTruthy();
  });

  it('Accepts invitations', async () => {
    const user = testUsers[0];
    await testServer
      .post(endpoint)
      .send({
        invitationId: invitations[0].id,
        response: true,
      })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.CREATED)
  });

  it('Declines invitation', async () => {
    const [guest]: any = await global.__getRandUsers(1);

    const invitation = await testServer
      .post(invitationEndpoint)
      .send({
        guestId: guest.id,
        CommunityRoleId: roles[0].id,
        CommunityId: communities[0].id,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED);


    return testServer
      .post(endpoint)
      .send({
        invitationId: invitation.body.id,
        response: false,
      })
      .set('authorization', guest.accessToken)
      .expect(StatusCodes.CREATED);
  });
  it('Accepts group membership promotion', async () => {
    const [guest]: any = await global.__getRandUsers(1);

    const adminRole = roles.find((role) => role.name === 'admin').id;
    const memberRole = roles.find((role) => role.name === 'member').id;
    const community = communities[0].id;

    // Sending a memberRole invitation

    const memberInvitation = await testServer
      .post(invitationEndpoint)
      .send({
        guestId: guest.id,
        CommunityRoleId: memberRole,
        CommunityId: community,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED);

    await testServer
      .post(endpoint)
      .send({
        invitationId: memberInvitation.body.id,
        response: true,
      })
      .set('authorization', guest.accessToken)
      .expect(StatusCodes.CREATED);

    const promotionInvitation = await testServer
      .post(invitationEndpoint)
      .send({
        guestId: guest.id,
        CommunityRoleId: adminRole,
        CommunityId: community,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED);

    return testServer
      .post(endpoint)
      .send({
        invitationId: promotionInvitation.body.id,
        response: true,
      })
      .set('authorization', guest.accessToken)
      .expect(StatusCodes.CREATED);



    // const { CommunityInvitationRequest, CommunityUsers } =
    //   global.__SEQUELIZE__.models;
    // const invitation = await CommunityInvitationRequest.findByPk(
    //   promotionInvitation.body.id
    // );
    // expect(invitation.response).toBe(true);
    // expect(invitation.responseDate).toBeDefined();

    // const communityUser = await CommunityUsers.findOne({
    //   where: {
    //     UserId: guest.id,
    //     CommunityId: community,
    //     CommunityRoleId: adminRole,
    //     untilDate: null,
    //   },
    // });

    // expect(communityUser.id).toBeDefined();
    // const oldRole = await CommunityUsers.findOne({
    //   where: {
    //     UserId: guest.id,
    //     CommunityId: community,
    //     CommunityRoleId: memberRole,
    //     untilDate: { [Op.ne]: null },
    //   },
    // });

    // expect(oldRole.id).toBeDefined();
  });

  it.todo('Denies group membership promotion');
  it.todo('User can become member if group is open without invitation');
});
