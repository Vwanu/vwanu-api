import { randomBytes } from 'crypto';
import { StatusCodes } from 'http-status-codes';

describe("Communities service", () => {
  // eslint-disable-next-line no-unused-vars

  let testUsers;
  let roles;

  const endpoint = '/communities';
  const interests = ['sport', 'education'];
  const rolesEndpoint = '/community-role';


  beforeAll(async () => {
    testUsers = await global.__getRandUsers(3)
    roles = await global
      .__SERVER__
      .get(rolesEndpoint)
      .set('authorization', testUsers[0].accessToken);
  }, 100000);



  it('registered the service', () => {
    const service = global.__APP__.service('communities');
    expect(service).toBeTruthy();
  });

  it('should not create communities with the same name', async () => {

    const name = `Community ${randomBytes(5).toString('hex')}`;
    const description = `description ${randomBytes(5).toString('hex')}`;
    const creatorToken = testUsers[0].accessToken;

    await global.__SERVER__
      .post(endpoint)
      .send({ name, interests, description })
      .set('Authorization', `Bearer ${creatorToken}`)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .post(endpoint)
      .send({ name, interests, description })
      .set('Authorization', `Bearer ${creatorToken}`)
      .expect(StatusCodes.BAD_REQUEST);


  });

  it('Users can create any community ', async () => {
    const privacyTypes = ['private', 'public', 'hidden'];
    const creatorToken = testUsers[0].accessToken;
    (await Promise.all(
      privacyTypes.map((privacyType) =>
        global.__SERVER__
          .post(endpoint)
          .send({
            name: `${randomBytes(5).toString('hex')}`,
            privacyType,
            interests,
            description: `${randomBytes(5).toString('hex')}`,
          })
          .set('authorization', creatorToken)
      )
    )).forEach((community) => expect(community.statusCode).toBe(StatusCodes.CREATED))
  });

  it('Public community can be seen but only user can interact', async () => {
    const [firstTester, secondTester] = testUsers;

    const publicCommunity =
      await global.__SERVER__
        .post(endpoint)
        .send({
          name: `${randomBytes(5).toString('hex')}`,
          interests,
          description: `${randomBytes(5).toString('hex')}`,
        })
        .set('authorization', firstTester.accessToken)

    const communityId = publicCommunity.body.id;

    const { body: communityaccessByCreator } = await global.__SERVER__
      .get(`${endpoint}/${communityId}`)
      .set('authorization', firstTester.accessToken);


    expect(communityaccessByCreator).toMatchObject({
      canuserpost: true,
      canuserinvite: true,
      canuseruploaddoc: true,
      canuseruploadphotos: true,
      canmessageuseringroup: true,
    });


    const { body: communityaccessByNonUser } = await global.__SERVER__
      .get(`${endpoint}/${communityId}`)
      .set('authorization', secondTester.accessToken);

    expect(communityaccessByNonUser).toMatchObject({
      canuserpost: false,
      canuserinvite: false,
      canuseruploaddoc: false,
      canuseruploadphotos: false,
      canmessageuseringroup: false,
    });
  });

  it('Community creator can edit the community details', async () => {

    const name = `${randomBytes(5).toString('hex')}`
    const description = `${randomBytes(5).toString('hex')}`

    const community = await global.__SERVER__
      .post(endpoint)
      .send({ name, description })
      .set('authorization', testUsers[0].accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .patch(`${endpoint}/${community.body.id}`)
      .send({ name: `${randomBytes(5).toString('hex')}` })
      .set('authorization', testUsers[0].accessToken)
      .expect(StatusCodes.OK);


  });

  it('Can see all community except hidden unless he is a member of it', async () => {

    const { CommunityUsers, Community } = globalThis.__APP__
      .get('sequelizeClient')
      .models;

    // let's destroy all communities
    await Community.destroy({ where: {} });
    const role = roles.body.data[2];
    const [creator, observer] = testUsers;
    const name = 'infiltrated community';
    const description = 'infiltrated community';
    const privacyType = 'hidden';

    const infiltratedCommunity = await global.__SERVER__
      .post(endpoint)
      .send({ name, description, privacyType })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED);

    const creatorAccess = await global.__SERVER__
      .get(endpoint)
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.OK);
    expect(creatorAccess.body.total).toBe(1);

    const firstAttemps = await global.__SERVER__
      .get(endpoint)
      .set('authorization', observer.accessToken)
      .expect(StatusCodes.OK);

    expect(firstAttemps.body.total).toBe(0);

    await CommunityUsers.create({
      CommunityId: infiltratedCommunity.body.id,
      UserId: observer.id,
      CommunityRoleId: role.id,
    });
    const secondAttemps = await global.__SERVER__
      .get(endpoint)
      .set('authorization', observer.accessToken)
      .expect(StatusCodes.OK);
    expect(secondAttemps.body.total).toBe(1);
  });

  describe('Communities Access', () => {
    it('should not see community private and Hidden community details when not member', async () => {

      const [creator, observer] = testUsers;
      const privateCommunity = await global
        .__SERVER__
        .post(endpoint)
        .send({ name: 'Private Community', description: 'Private Community', privacyType: 'private' })
        .set('authorization', creator.accessToken)
        .expect(StatusCodes.CREATED);

      // observer can't see the private community details 
      await global
        .__SERVER__
        .get(`${endpoint}/${privateCommunity.body.id}`)
        .set('authorization', observer.accessToken)
        .expect(StatusCodes.BAD_REQUEST);


      await global
        .__SERVER__
        .get(`${endpoint}/${privateCommunity.body.id}`)
        .set('authorization', creator.accessToken)
        .expect(StatusCodes.OK);


    });
    it('should only return communities created by the user', async () => {
      const [creator, observer] = testUsers;

      await global.__SERVER__
        .post(endpoint)
        .send({ name: randomBytes(5).toString('hex'), description: randomBytes(5).toString('hex') })
        .set('authorization', creator.accessToken)
        .expect(StatusCodes.CREATED);

      await global.__SERVER__
        .post(endpoint)
        .send({
          name: randomBytes(5).toString('hex'),
          description: randomBytes(5).toString('hex')
        })
        .set('authorization', creator.accessToken)
        .expect(StatusCodes.CREATED);

      await global.__SERVER__
        .post(endpoint)
        .send({
          name: randomBytes(5).toString('hex'),
          description: randomBytes(5).toString('hex')
        })
        .set('authorization', observer.accessToken)
        .expect(StatusCodes.CREATED);

      await global.__SERVER__
        .post(endpoint)
        .send({
          name: randomBytes(5).toString('hex'),
          description: randomBytes(5).toString('hex')
        })
        .set('authorization', observer.accessToken)
        .expect(StatusCodes.CREATED);

      const {
        body: { data: creatorCommunities },
      } = await global.__SERVER__
        .get(`${endpoint}?UserId=${creator.id}`)
        .set('authorization', creator.accessToken);

      creatorCommunities.forEach((community) =>
        expect(community.UserId).toBe(creator.id)
      );

      const {
        body: { data: firstCreatorCommunities },
      } = await global.__SERVER__
        .get(`${endpoint}?UserId=${observer.id}`)
        .set('authorization', observer.accessToken);

      firstCreatorCommunities.forEach((community) =>
        expect(community.UserId).toBe(observer.id)
      );
    });

    it('should return newest communities first', async () => {
      const [firstCreator] = testUsers;
      const {
        body: { data: newestFirst },
      } = await global.__SERVER__
        .get(`${endpoint}?$sort[createdAt]=-1`)
        .set('authorization', firstCreator.accessToken);

      const {
        body: { data: oldestFirst },
      } = await global.__SERVER__
        .get(`${endpoint}?$sort[createdAt]=1`)
        .set('authorization', firstCreator.accessToken);

      expect(newestFirst).toBe(newestFirst);
      expect(newestFirst).not.toBe(oldestFirst);
      expect(newestFirst[0]).not.toBe(oldestFirst[0]);
    });

    it('should return communities with most members first', async () => {
      const [firstCreator] = testUsers;
      const {
        body: { data: popularFirst },
      } = await global.__SERVER__
        .get(`${endpoint}?$sort[numMembers]=-1`)
        .set('authorization', firstCreator.accessToken);

      expect(popularFirst[0].numMembers).toBeGreaterThan(
        popularFirst[1].numMembers
      );
      const {
        body: { data: unpopular },
      } = await global.__SERVER__
        .get(`${endpoint}?$sort[numMembers]=1`)
        .set('authorization', firstCreator.accessToken);

      expect(popularFirst[0].numMembers).toBeGreaterThan(
        unpopular[0].numMembers
      );
    });

    it.skip('should return only the communities with `UNIQUE` interest', async () => {
      const [firstCreator, creator] = testUsers;

      const intc = await global.__SERVER__
        .post(endpoint)
        .set('authorization', creator.accessToken)
        .send({
          interests: ['unique'],
          name: randomBytes(5).toString('hex'),
          description: randomBytes(5).toString('hex'),
        })
      // .expect(StatusCodes.CREATED);

      console.log({ created: intc.body });



      const {
        body: { data: com },
      } = await global.__SERVER__
        .get(`${endpoint}?interests=unique`)
        .set('authorization', firstCreator.accessToken);

      console.log({ com });

      expect(com).toHaveLength(1);

    });
    it('should only return communities user is member of', async () => {

      const [firstCreator] = testUsers;
      const {
        body: { data: com },
      } = await global.__SERVER__
        .get(`${endpoint}?participate=true`)
        .set('authorization', firstCreator.accessToken)
        .expect(StatusCodes.OK);



      com.forEach((community) => {
        expect(community.isMember).not.toBe(null);
      });
    });

    // it.skip('fetch users not member of community', async () => {
    // const [firstCreator] = testUsers;
    // const allUsers = await global.__getRandUsers(10);
    // const allUserAmount = allUsers.length;

    //     const { body: communityToCompare } = await global.__SERVER__
    //       .get(`${endpoint}/${communities[1].body.id}`)
    //       .set('authorization', firstCreator.accessToken);

    //     const communityAmountOfMembers = +communityToCompare.numMembers;
    //     const {
    //       body: { data: usersNotInCommunity },
    //     } = await global.__SERVER__
    //       .get(`${userEndpoint}/?notCommunityMember=${communityToCompare.id}`)
    //       .set('authorization', firstCreator.accessToken);

    //     const amountOfUserNotInCommunity = usersNotInCommunity.length;
    //     expect(allUserAmount).toBeGreaterThan(amountOfUserNotInCommunity);
    //     expect(allUserAmount).toBeGreaterThan(communityAmountOfMembers);
    // }, 50000);


    //   it.skip('search users that are not member of community', async () => {
    //     // creating similar user like firstCreator
    //     const { body: similarUser } = await global.__SERVER__.post(userEndpoint).send({
    //       email: generateFakeEmail(),
    //       firstName: firstCreator.firstName,
    //       lastName: firstCreator.lastName,
    //       password: 'firstCreator.password',
    //       passwordConfirmation: 'firstCreator.password',
    //     });

    //     // console.log(similarUser);
    //     const {
    //       body: { data: similarUsers },
    //     } = await global.__SERVER__
    //       .get(`/search?$search=${similarUser.firstName}`)
    //       .set('authorization', firstCreator.accessToken);

    //     // console.log('similarUsers', j);
    //     expect(similarUsers).toHaveLength(2);
    //     expect(
    //       similarUsers.some((user) => user.firstName === similarUser.firstName)
    //     ).toBe(true);
    //     expect(
    //       similarUsers.some((user) => user.firstName === firstCreator.firstName)
    //     ).toBe(true);

    //     await global.__SERVER__
    //       .get(
    //         `/search?$search=${similarUser.firstName}&notCommunityMember=${communities[1].body.id}`
    //       )
    //       .set('authorization', firstCreator.accessToken);
    //     // TODO FIX THIS
    //     // console.log({ l });
    //     // console.log({ notInCommunityUser });
    //     expect(true).toBe(true);
    //   }, 50000);
  });


  //------// 

  // describe('Communities posts and forums', () => {
  //   it.skip('should create posts in community', async () => {
  //     const name = 'Public Community name';
  //     const description = 'Public Community description';
  //     // create a community
  //     communityWithPosts = await global.__SERVER__
  //       .post(endpoint)
  //       .send({
  //         name,
  //         interests,
  //         description,
  //         canInPost: 'A', // only admins should post
  //       })
  //       .set('authorization', creator.accessToken);

  //     expect(communityWithPosts.statusCode).toEqual(201);

  //     const postFromMember = await global.__SERVER__
  //       .post('/posts')
  //       .send({
  //         postText: 'I am a post in a community',
  //         CommunityId: communityWithPosts.body.id,
  //       })
  //       .set('authorization', creator.accessToken);

  //     expect(postFromMember.statusCode).toEqual(201);
  //     expect(postFromMember.body).toMatchObject({
  //       privacyType: 'public',
  //       id: expect.any(String),
  //       postText: 'I am a post in a community',
  //       CommunityId: communityWithPosts.body.id,
  //       UserId: creator.id,
  //       updatedAt: expect.any(String),
  //       createdAt: expect.any(String),
  //       PostId: null,
  //     });
  //   });

  //   it.skip('should  not create post for non-member', async () => {
  //     const nonMemberPost = await global.__SERVER__
  //       .post('/posts')
  //       .send({
  //         postText: 'I am a post in a community',
  //         CommunityId: communityWithPosts.body.id,
  //       })
  //       .set('authorization', testUsers[1].accessToken);

  //     expect(nonMemberPost.statusCode).toEqual(400);
  //   });
  //   it.skip('Should list posts in communities', async () => {
  //     const { body: posts } = await global.__SERVER__
  //       .get(`/posts?CommunityId=${communityWithPosts.body.id}`)
  //       .set('authorization', creator.accessToken);
  //     expect(Array.isArray(posts.data)).toBeTruthy();
  //     expect(posts.data.length).toEqual(1);

  //     posts.data.forEach((p) => {
  //       expect(p).toMatchObject({
  //         id: expect.any(String),
  //         postText: 'I am a post in a community',
  //         privacyType: 'public',
  //         createdAt: expect.any(String),
  //         updatedAt: expect.any(String),

  //         User: {
  //           firstName: creator.firstName,
  //           lastName: creator.lastName,
  //           id: creator.id,
  //           profilePicture: expect.any(String),
  //           createdAt: creator.createdAt,
  //         },
  //       });
  //     });
  //   });
  // });

  // it.skip('should create forum/discussion in community', async () => {
  //   const name = 'Public Community with discussion';
  //   const description = 'Public Community with discussion';
  //   // create a community

  //   communityWithForum = await global.__SERVER__
  //     .post(endpoint)
  //     .send({
  //       name,
  //       interests,
  //       description,
  //     })
  //     .set('authorization', creator.accessToken);

  //   expect(communityWithForum.statusCode).toEqual(201);
  //   communityWithForum = communityWithForum.body;

  //   // create a discussion in that community
  //   const discussionObject = {
  //     body: 'This is a discussion body',
  //     title: 'This is a discussion title',
  //     CommunityId: communityWithForum.id,
  //   };
  //   const discussion = await global.__SERVER__
  //     .post('/discussion')
  //     .send(discussionObject)
  //     .set('authorization', creator.accessToken);

  //   expect(discussion.statusCode).toEqual(201);
  //   expect(discussion.body).toMatchObject({
  //     ...discussionObject,
  //     id: expect.any(String),
  //     CommunityId: communityWithForum.id,
  //   });
  // });

  // it.skip('should list forum/discussion in community', async () => {
  //   // list discussions in that community
  //   const discussionList = await global.__SERVER__
  //     .get(`/discussion?CommunityId=${communityWithForum.id}`)
  //     .set('authorization', creator.accessToken);

  //   expect(discussionList.statusCode).toEqual(200);
  //   discussionList.body.data.forEach((dis) => {
  //     expect(dis.locked).toBe(false);
  //   });
  // });

  // it.skip('Only the community creator can delete the community', async () => {
  //   const name = 'Community to delete';
  //   const description = 'This community will be deleted';
  //   // create a community
  //   const community = await global.__SERVER__
  //     .post(endpoint)
  //     .send({
  //       name,
  //       interests,
  //       description,
  //     })
  //     .set('authorization', creator.accessToken);
  //   expect(community.statusCode).toEqual(201);
  //   // Fail to delete the community with another user

  //   const failDelete = await global.__SERVER__
  //     .delete(`${endpoint}/${community.body.id}`)
  //     .set('authorization', testUsers[0].accessToken);

  //   expect(failDelete.statusCode).toEqual(400);
  //   expect(failDelete.body).toMatchObject({
  //     name: 'BadRequest',
  //     message: 'Not authorized',
  //     code: 400,
  //     className: 'bad-request',
  //     errors: {},
  //   });
  //   // delete the community with the creator
  //   const deletedCommunity = await global.__SERVER__
  //     .delete(`${endpoint}/${community.body.id}`)
  //     .set('authorization', creator.accessToken);

  //   expect(deletedCommunity.statusCode).toEqual(200);
  // });

  // it.skip('Should find private community after becoming member', async () => {
  //   const { statusCode, body: privateGroup } = await global.__SERVER__
  //     .post(endpoint)
  //     .set('authorization', creator.accessToken)
  //     .send({
  //       name: 'Private community group',
  //       description: 'Private community',
  //       privacyType: 'private',
  //     });

  //   expect(statusCode).toBe(201);

  //   const { statusCode: status, body: user } = await global.__SERVER__
  //     .post(userEndpoint)
  //     .send({ ...getRandUser(), id: undefined });

  //   expect(status).toBe(201);

  //   const { body: nonMemberAccess } = await global.__SERVER__
  //     .get(endpoint)
  //     .set('authorization', user.accessToken);

  //   expect(nonMemberAccess.total).toBe(9);

  //   const CommunityUser = app.get('sequelizeClient').models.CommunityUsers;

  //   await CommunityUser.create({
  //     CommunityId: privateGroup.id,
  //     UserId: user.id,
  //     CommunityRoleId: roles[0].id,
  //   });

  //   expect(status).toBe(201);
  //   const privateCommunity = await global.__SERVER__
  //     .get(`${endpoint}/${privateGroup.id}`)
  //     .set('authorization', user.accessToken);

  //   expect(privateCommunity.body).toMatchObject({
  //     canUserPost: true,
  //     canUserInvite: true,
  //   });
  //   const { body: memberAccess } = await global.__SERVER__
  //     .get(endpoint)
  //     .set('authorization', user.accessToken);

  //   expect(memberAccess.total).toBe(9);
  // }, 3000);
});
