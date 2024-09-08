import { randomBytes } from 'crypto';
import { StatusCodes } from "http-status-codes";


describe("'communityInvitationRequest' service", () => {

  let adminRoleID: string;
  let memberRoleID: string;
  const rolesEndpoint = '/community-role';
  const communityEndpoint = '/communities';
  const endpoint = '/community-invitation-request';

  beforeAll(async () => {
    const [creator] = await global.__getRandUsers(1)
    const memberRole = await global.__SERVER__
      .get(rolesEndpoint)
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.OK)

    adminRoleID = memberRole.body.data.find(role => role.name === 'admin').id
    memberRoleID = memberRole.body.data.find(role => role.name === 'member').id
  });

  it('registered the service', () => {

    const service = global.__APP__.service('community-invitation-request');
    expect(service).toBeTruthy();
  });
  it('Creator can send invitation for any role', async () => {
    const [creator, guess] = await global.__getRandUsers(2)

    const community = await global.__SERVER__
      .post(communityEndpoint).send({
        name: `${randomBytes(5).toString('hex')}`,
        privacyType: 'public',
        description: `${randomBytes(10).toString('hex')}`,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)



    await global.__SERVER__.post(endpoint)
      .send({
        guestId: guess.id,
        CommunityRoleId: memberRoleID,
        CommunityId: community.body.id
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)


    //   const { CommunityInvitationRequest } = app.get('sequelizeClient').models;
    //   // Invitation response
    //   invitations.map(async (invitation, idx) => {
    //     expect(invitation).toMatchObject({
    //       id: expect.any(String),
    //       guestId: testUsers[idx].id,
    //       CommunityRoleId: roles[idx].id,
    //       hostId: creator.id,
    //       updatedAt: expect.any(String),
    //       createdAt: expect.any(String),
    //       CommunityId: communities[idx].id,
    //       email: null,
    //     });
    //     // Checking the guest request exist in the database
    //     const guest = await CommunityInvitationRequest.findOne({
    //       where: {
    //         hostId: creator.id,
    //         guestId: testUsers[idx].id,
    //         CommunityRoleId: roles[idx].id,
    //       },
    //     });
    //     expect(guest).toMatchObject({
    //       id: invitation.id,
    //       email: null,
    //       response: null,
    //       responseDate: null,
    //       CommunityId: invitation.CommunityId,
    //       guestId: testUsers[idx].id,
    //       hostId: creator.id,
    //       CommunityRoleId: roles[idx].id,
    //     });
    //     const invitationRecords = await server
    //       .get(`${endpoint}?guestId=${testUsers[idx].id}`)
    //       .set('authorization', testUsers[idx].accessToken);
    //     const inv = InvitationObJect;
    //     delete inv.guestid;
    //     delete inv.hostid;
    //     expect(invitationRecords.body.data.length).toBe(1);
    //     expect(invitationRecords.body.data[0]).toMatchObject({
    //       ...inv,

    //       guest: expect.objectContaining({
    //         firstName: testUsers[idx].firstName,
    //         lastName: testUsers[idx].lastName,
    //         id: testUsers[idx].id,
    //         createdAt: testUsers[idx].createdAt,
    //       }),
    //       host: expect.objectContaining({
    //         firstName: creator.firstName,
    //         lastName: creator.lastName,
    //         id: creator.id,
    //         createdAt: creator.createdAt,
    //       }),
    //       CommunityRole: expect.objectContaining({
    //         ...roles[idx],
    //       }),

    //       Community: expect.objectContaining({
    //         id: expect.any(String),
    //         name: expect.any(String),
    //         description: expect.any(String),
    //       }),
    //     });

    //     return 1;
  });

  it('Host can see all invitation they sent', async () => {

    const [creator, ...users] = await global.__getRandUsers(3)

    const community = await global.__SERVER__
      .post(communityEndpoint).send({
        name: `${randomBytes(5).toString('hex')}`,
        privacyType: 'public',
        description: `${randomBytes(10).toString('hex')}`,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)

    await Promise.all(
      users.map(guess =>
        global
          .__SERVER__
          .post(endpoint)
          .send({
            guestId: guess.id,
            CommunityRoleId: memberRoleID,
            CommunityId: community.body.id
          })
          .set('authorization', creator.accessToken)
      ))

    const invitationsISent = await global.__SERVER__
      .get(`${endpoint}/?hostId=${creator.id}`)
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.OK)

    expect(invitationsISent.body.data.length).toBe(users.length)

  });

  it('Guest can see all invitation they have received', async () => {

    const [creator, ...users] = await global.__getRandUsers(3)

    const community = await global.__SERVER__
      .post(communityEndpoint).send({
        name: `${randomBytes(5).toString('hex')}`,
        privacyType: 'public',
        description: `${randomBytes(10).toString('hex')}`,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)


    await Promise.all(
      users.map(guess =>
        global
          .__SERVER__
          .post(endpoint)
          .send({
            guestId: guess.id,
            CommunityRoleId: memberRoleID,
            CommunityId: community.body.id
          })
          .set('authorization', creator.accessToken)
      ))

    const receivedInvitations = await Promise.all(
      users.map(user =>
        global.__SERVER__
          .get(`${endpoint}/?guestId=${user.id}`)
          .set('authorization', user.accessToken)
          .expect(StatusCodes.OK)
      ))

    receivedInvitations.forEach(inv => {
      expect(inv.body.data.length).toBe(1)
    })
  });

  it("Authorized can update invitation's role", async () => {

    const [creator, guess] = await global.__getRandUsers(2)

    const community = await global.__SERVER__
      .post(communityEndpoint).send({
        name: `${randomBytes(5).toString('hex')}`,
        privacyType: 'public',
        description: `${randomBytes(10).toString('hex')}`,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)

    const invitation = await global.__SERVER__.post(endpoint)
      .send({
        guestId: guess.id,
        CommunityRoleId: memberRoleID,
        CommunityId: community.body.id
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)

    await global.__SERVER__.patch(`${endpoint}/${invitation.body.id}`)
      .send({ CommunityRoleId: adminRoleID })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.OK)


  });

  it('Creator can remove invitation for any role', async () => {

    const [creator, guess] = await global.__getRandUsers(2)

    const community = await global.__SERVER__
      .post(communityEndpoint).send({
        name: `${randomBytes(5).toString('hex')}`,
        privacyType: 'public',
        description: `${randomBytes(10).toString('hex')}`,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)

    const invitations = await global.__SERVER__.post(endpoint)
      .send({
        guestId: guess.id,
        CommunityRoleId: memberRoleID,
        CommunityId: community.body.id
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)

    await global
      .__SERVER__
      .delete(`${endpoint}/${invitations.body.id}`)
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.OK)
  });
});

// !todo
// it.todo('should not see invitations sent to others unless admin');
// it.todo('Guest cannot receive two different invitations');
// it.todo('Only the one who invited can modify or delete the invitation');

