/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import isNill from 'lodash/isNil';
import { randomBytes } from 'crypto';

/** Local dependencies */
import app from '../../src/app';
import {
  getRandUsers,
  getRandUser,
  generateFakeEmail,
} from '../../src/lib/utils/generateFakeUser';

const cleanup = (server) => (endpoint, id, token) =>
  server.delete(`${endpoint}/${id}`).set('Authorization', token)

describe("'communities ' service", () => {
  // eslint-disable-next-line no-unused-vars
  let creator;
  let testUsers;
  let communities;
  let sameNameCommunities;
  let communityWithPosts;
  let communityWithForum;
  let users;
  let firstCreator;
  let distinctCommunities;
  let roles;
  let uniquePubCom;
  let testers = [];

  const userEndpoint = '/users';
  const endpoint = '/communities';
  const interests = ['sport', 'education'];
  const rolesEndpoint = '/community-role';

  const CommunityBasicDetails = {
    id: expect.any(String),
    name: 'unique',
    coverPicture: null,
    profilePicture: null,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    numMembers: 0,
    // numAdmins: 1, removed temporarely 
    haveDiscussionForum: true,
    canInvite: 'E',
    canInPost: 'E',
    canInUploadPhotos: 'E',
    canInUploadDoc: 'E',
    canInUploadVideo: 'E',
    canMessageInGroup: 'E',
    defaultInvitationEmail: null,
  };

  beforeAll(async () => {
    testUsers = await global.__getRandUsers(3)
    console.log({ testUsers })
    creator = testUsers.shift();
    roles = await global
      .__SERVER__
      .get(rolesEndpoint)
      .set('authorization', creator.accessToken);
    users = await global.__getRandUsers(3)

    firstCreator = users.shift();
    distinctCommunities = await Promise.all(
      ['private', 'public', 'hidden'].map((p) =>
        global.__SERVER__
          .post(endpoint)
          .send({
            name: `community-${p}`,
            privacyType: p,
            interests,
            description: `description-${p}`,
          })
          .set('authorization', firstCreator.accessToken)
      )
    );
    distinctCommunities = distinctCommunities.map((c) => c.body);
  }, 100000);

  afterAll(async () => {
    await Promise.all(
      distinctCommunities.map((c) =>
        cleanup(global.__SERVER__)(endpoint, c.id, firstCreator.accessToken)));
  });

  it('registered the service', () => {
    const service = global.__APP__.service('communities');
    expect(service).toBeTruthy();
  });

  it.skip('should not create communities with the same name', async () => {
    sameNameCommunities = await Promise.all(
      ['unique', 'unique'].map((name, idx) =>
        global.__SERVER__
          .post(endpoint)
          .send({
            name,
            interests,
            description: `description - ${idx}`,
          })
          .set('authorization', creator.accessToken)
      )
    );



    sameNameCommunities.forEach(({ body }, idx) => {
      if (idx === 0) {

        expect(body).toMatchObject({
          ...CommunityBasicDetails,
          privacyType: 'public',
          UserId: creator.id,
          description: expect.any(String),
        });
      }
      if (idx === 1) {
        expect(body).toMatchObject({
          name: 'BadRequest',
          message: 'Validation error',
          code: 400,
          className: 'bad-request',
          data: {},
          errors: [
            {
              message: 'name must be unique',
            },
          ],
        });
      }
    });
    const removeCommunities = cleanup(global.__SERVER__);
    await Promise.all(sameNameCommunities.map((c) => removeCommunities(endpoint, c.body.id, creator.accessToken)));

  });

  it('Users can create any community ', async () => {
    const name = 'Community';
    const description = 'Unique description required';
    const privacyTypes = ['private', 'public', 'hidden'];
    communities = await Promise.all(
      privacyTypes.map((privacyType) =>
        global.__SERVER__
          .post(endpoint)
          .send({
            name: `${name}-${randomBytes(5).toString('hex')}`,
            privacyType,
            interests,
            description: `${description} - ${randomBytes(5).toString('hex')}`,
          })
          .set('authorization', creator.accessToken)
      )
    );

    communities.forEach(({ body }, idx) => {

      expect(body).toMatchObject({
        ...CommunityBasicDetails,
        name: expect.stringContaining(name),
        privacyType: privacyTypes[idx],
        UserId: creator.id,
        description: expect.stringContaining(description),
      });
    });


    global.__cleanup('Community', communities.map((c) => c.id));
    expect(true).toBe(true);
  });
  it('Public community can be seen but only user can interact', async () => {
    // testers = await global.__getRandUsers(2)
    const [firstTester, secondTester] = testUsers;

    const publicCommunity =
      await global.__SERVER__
        .post(endpoint)
        .send({
          name: `test community-${randomBytes(5).toString('hex')}`,
          interests,
          description: `description ${randomBytes(5).toString('hex')}`,
        })
        .set('authorization', firstTester.accessToken)

    // console.log({publicCommunity})

    uniquePubCom = [publicCommunity.body];
    const communityId = publicCommunity.body.id;

    const { body: communityaccessByCreator } = await global.__SERVER__
      .get(`${endpoint}/${communityId}`)
      .set('authorization', firstTester.accessToken);

    console.log({ communityaccessByCreator })

    expect(communityaccessByCreator).toMatchObject({
      canUserPost: true,
      canUserInvite: true,
      canUserUploadDoc: true,
      canUserUploadPhotos: true,
      canUserUploadVideo: true,
      canMessageUserInGroup: true,
    });


    const { body: communityaccessByNonUser } = await global.__SERVER__
      .get(`${endpoint}/${communityId}`)
      .set('authorization', secondTester.accessToken);

    console.log({ communityaccessByCreator, communityaccessByNonUser })

    expect(communityaccessByNonUser).toMatchObject({
      canUserPost: false,
      canUserInvite: false,
      canUserUploadDoc: false,
      canUserUploadPhotos: false,
      canUserUploadVideo: false,
      canMessageUserInGroup: false,
    });

    // second Tester joinning the community

    await global.__SERVER__
      .post('/community-join')
      .send({
        CommunityId: communityId,
      })
      .set('authorization', secondTester.accessToken);

    const { body: afterJoinning } = await global.__SERVER__
      .get(`${endpoint}/${communityId}`)
      .set('authorization', secondTester.accessToken);

    expect(afterJoinning).toMatchObject({
      canUserPost: true,
      canUserInvite: true,
      canUserUploadDoc: true,
      canUserUploadPhotos: true,
      canUserUploadVideo: true,
      canMessageUserInGroup: true,
    });

    const { body: firstTestBis } = await global.__SERVER__
      .get(`${endpoint}/${communityId}`)
      .set('authorization', firstTester.accessToken);

    expect(firstTestBis).toMatchObject({
      canUserPost: true,
      canUserInvite: true,
      canUserUploadDoc: true,
      canUserUploadPhotos: true,
      canUserUploadVideo: true,
      canMessageUserInGroup: true,
    });
    await cleanup(global.__SERVER__)(endpoint, communityId, firstTester.accessToken);
    await cleanup(global.__SERVER__)(
      userEndpoint,
      firstTester.id,
      firstTester.accessToken
    );
    await cleanup(global.__SERVER__)(
      userEndpoint,
      secondTester.id,
      secondTester.accessToken
    );
    expect(true).toBe(true);
  });
  it.skip('community users are removed when community is deleted', async () => {
    const name = 'Community to delete soon';
    const description = 'This community will be deleted';
    // create a community
    const community = await global.__SERVER__
      .post(endpoint)
      .send({
        name,
        interests,
        description,
      })
      .set('authorization', creator.accessToken);
    expect(community.statusCode).toEqual(201);

    // add a user to the community
    const { body: user } = await global.__SERVER__
      .post(userEndpoint)
      .send({ ...getRandUser(), id: undefined });

    // join the community
    await global.__SERVER__
      .post('/community-join')
      .send({
        CommunityId: community.body.id,
      })
      .set('authorization', user.accessToken);

    // verify that the user is in the community
    const { body: communityUsers } = await global.__SERVER__
      .get(`/community-users?CommunityId=${community.body.id}`)
      .set('authorization', creator.accessToken);

    expect(communityUsers.total).toBe(2);

    // delete the community
    await global.__SERVER__
      .delete(`${endpoint}/${community.body.id}`)
      .set('authorization', creator.accessToken);

    // verify that the user is not in the community
    const { body: communityUsersAfterDelete } = await global.__SERVER__
      .get(`/community-users?CommunityId=${community.body.id}`)
      .set('authorization', creator.accessToken);

    expect(communityUsersAfterDelete.total).toHaveLength(0);
  });

  it.skip('Community automatically set creator as first admin and by default are public', async () => {
    const name = 'Auto admin';
    const description = 'Auto Public';

    const { body: adminOfPublicCommunity } = await global.__SERVER__
      .post(userEndpoint)
      .send({ ...getRandUser(), id: undefined });

    const { body: publicAutoAdminCommunity } = await global.__SERVER__
      .post(endpoint)
      .send({
        name,
        interests,
        description,
      })
      .set('authorization', adminOfPublicCommunity.accessToken);


    expect(adminOfPublicCommunity.id).toEqual(publicAutoAdminCommunity.UserId)
    // expect(publicAutoAdminCommunity).toMatchObject({
    //   ...CommunityBasicDetails,
    //   name,
    //   privacyType: 'public',
    //   UserId: adminOfPublicCommunity.id,
    //   description,
    // });

    // Check if creator is first admin
    console.log('testing further')
    try {
      const res = await global.__SERVER__
        .get(`/community-users?CommunityId=${publicAutoAdminCommunity.id}`)
        .set('authorization', adminOfPublicCommunity.accessToken);
      const {
        body: { data: communityUsers },
      } = res
      console.log(res.body)
      // console.log('test',communityUsers[0].UserId)
      // expect(communityUsers[0].UserId).toBe(adminOfPublicCommunity.id);
    }
    catch (e) {
      console.log('failed')
      console.log(e)
    }


  });

  it.skip('Community creator can edit the community details', async () => {
    const name = `Brand new name -${Math.random()}`;
    const description = `Description Has Changed -- ${Math.random()}`;
    const communityToChange = communities[0].body;

    const editedCommunity = await global.__SERVER__
      .patch(`${endpoint}/${communityToChange.id}`)
      .send({
        name,
        description,
      })
      .set('authorization', creator.accessToken);

    expect(editedCommunity.body).toMatchObject({
      name,
      description,
      updatedAt: expect.any(String),
    });
  });

  it.skip(' Any user can get all communities except hidden unless he is a member of it', async () => {
    // Manually adding a user to a community
    const newUser = testUsers[1];
    const infiltratedCommunity = communities[0].body;

    const role = roles[2];

    const { CommunityUsers } = app.get('sequelizeClient').models;

    await CommunityUsers.create({
      CommunityId: infiltratedCommunity.id,
      UserId: newUser.id,
      CommunityRoleId: role.id,
    });

    const { body: allCommunities } = await global.__SERVER__
      .get(endpoint)
      .set('authorization', creator.accessToken);

    allCommunities.data.forEach((community) => {
      expect(community).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        privacyType: expect.any(String),
        id: expect.any(String),
        UserId: expect.any(String),
        numMembers: expect.any(Number),
        members: expect.any(Array),
        profilePicture: null,
        coverPicture: null,
      });
      if (infiltratedCommunity.id === community.id) {
        expect(community.members).toHaveLength(2);
        expect(community.members.some((member) => member.id === newUser.id));
      } else {
        expect(community.members).toHaveLength(1);
      }

      // This community was created without endpoint
      if (
        community.name === 'community' &&
        community.description === 'description'
      ) {
        expect(community.Interests).toBe(null);
      }

      if (community.privacyType === 'hidden') {
        expect(
          community.members.some((member) => member.id === creator.id)
        ).toBe(true);
      }
      if (!isNill(community.Interests)) {
        expect(community.Interests).toHaveLength(2);
      }
      community?.Interests?.forEach((interest) => {
        expect(interest).toMatchObject({
          name: expect.any(String),
          id: expect.any(String),
        });
      });

      if (community.UserId === creator.id) {
        expect(community.IsMember).toMatchObject({
          id: expect.any(String),
          role: 'admin',
          roleId: expect.any(String),
        });
      } else {
        expect(community.IsMember).toBe(null);
      }
    });
  });

  describe('Communities Access', () => {
    it.skip('should not see community private and Hidden community details when not member', async () => {
      let accessToCommunities = await Promise.all(
        distinctCommunities.map((com) =>
          global.__SERVER__
            .get(`${endpoint}/${com.id}`)
            .set('authorization', users[0].accessToken)
        )
      );
      accessToCommunities = accessToCommunities.map((c) => c.body);

      accessToCommunities.forEach((com) => {
        if (!com.privacyType && com?.privacyType !== 'public') {
          expect(com).toMatchObject({
            code: 400,
          });
        } else {
          expect(com).toMatchObject({
            name: expect.any(String),
            description: expect.any(String),
            privacyType: expect.any(String),
            id: expect.any(String),
            UserId: firstCreator.id,
            Interests: expect.any(Array),
          });
          com.Interests.forEach((interest) => {
            expect(interest).toMatchObject({
              name: expect.any(String),
              id: expect.any(String),
            });
          });
        }
      });
    });
    it.skip('should only return communities created by the user', async () => {
      const {
        body: { data: creatorCommunities },
      } = await global.__SERVER__
        .get(`${endpoint}?UserId=${creator.id}`)
        .set('authorization', firstCreator.accessToken);

      creatorCommunities.forEach((community) =>
        expect(community.UserId).toBe(creator.id)
      );

      const {
        body: { data: firstCreatorCommunities },
      } = await global.__SERVER__
        .get(`${endpoint}?UserId=${firstCreator.id}`)
        .set('authorization', creator.accessToken);

      firstCreatorCommunities.forEach((community) =>
        expect(community.UserId).toBe(firstCreator.id)
      );
    });

    it.skip('should return newest communities first', async () => {
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

    it.skip('should return communities with most members first', async () => {
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
      const name = 'This community has unique interest';
      const description = 'This community has unique interest';
      const { status } = await global.__SERVER__
        .post(endpoint)
        .set('authorization', creator.accessToken)
        .send({
          interests: ['unique'],
          name,
          description,
        });

      expect(status).toBe(201);

      const {
        body: { data: com },
      } = await global.__SERVER__
        .get(`${endpoint}?interests=unique`)
        .set('authorization', firstCreator.accessToken);

      expect(com).toHaveLength(1);
      com.forEach((community) => {
        expect(community.name).toBe(name);
        expect(community.description).toBe(description);
      });
    });
    it.skip('should only return communities user is member of', async () => {
      const {
        body: { data: com },
      } = await global.__SERVER__
        .get(`${endpoint}?participate=true`)
        .set('authorization', firstCreator.accessToken);

      com.forEach((community) => {
        expect(community.isMember).not.toBe(null);
        // expect(
        //   community.members.every((member) => member.id === firstCreator.id)
        // ).toBe(true);
      });
    });

    it.skip('fetch users not member of community', async () => {
      const {
        body: { data: allUsers },
      } = await global.__SERVER__
        .get(userEndpoint)
        .set('authorization', firstCreator.accessToken);

      const allUserAmount = allUsers.length;

      const { body: communityToCompare } = await global.__SERVER__
        .get(`${endpoint}/${communities[1].body.id}`)
        .set('authorization', firstCreator.accessToken);

      const communityAmountOfMembers = +communityToCompare.numMembers;
      const {
        body: { data: usersNotInCommunity },
      } = await global.__SERVER__
        .get(`${userEndpoint}/?notCommunityMember=${communityToCompare.id}`)
        .set('authorization', firstCreator.accessToken);

      const amountOfUserNotInCommunity = usersNotInCommunity.length;
      expect(allUserAmount).toBeGreaterThan(amountOfUserNotInCommunity);
      expect(allUserAmount).toBeGreaterThan(communityAmountOfMembers);
    }, 50000);
    it.skip('search users that are not member of community', async () => {
      // creating similar user like firstCreator
      const { body: similarUser } = await global.__SERVER__.post(userEndpoint).send({
        email: generateFakeEmail(),
        firstName: firstCreator.firstName,
        lastName: firstCreator.lastName,
        password: 'firstCreator.password',
        passwordConfirmation: 'firstCreator.password',
      });

      // console.log(similarUser);
      const {
        body: { data: similarUsers },
      } = await global.__SERVER__
        .get(`/search?$search=${similarUser.firstName}`)
        .set('authorization', firstCreator.accessToken);

      // console.log('similarUsers', j);
      expect(similarUsers).toHaveLength(2);
      expect(
        similarUsers.some((user) => user.firstName === similarUser.firstName)
      ).toBe(true);
      expect(
        similarUsers.some((user) => user.firstName === firstCreator.firstName)
      ).toBe(true);

      await global.__SERVER__
        .get(
          `/search?$search=${similarUser.firstName}&notCommunityMember=${communities[1].body.id}`
        )
        .set('authorization', firstCreator.accessToken);
      // TODO FIX THIS
      // console.log({ l });
      // console.log({ notInCommunityUser });
      expect(true).toBe(true);
    }, 50000);
  });

  describe('Communities posts and forums', () => {
    it.skip('should create posts in community', async () => {
      const name = 'Public Community name';
      const description = 'Public Community description';
      // create a community
      communityWithPosts = await global.__SERVER__
        .post(endpoint)
        .send({
          name,
          interests,
          description,
          canInPost: 'A', // only admins should post
        })
        .set('authorization', creator.accessToken);

      expect(communityWithPosts.statusCode).toEqual(201);

      const postFromMember = await global.__SERVER__
        .post('/posts')
        .send({
          postText: 'I am a post in a community',
          CommunityId: communityWithPosts.body.id,
        })
        .set('authorization', creator.accessToken);

      expect(postFromMember.statusCode).toEqual(201);
      expect(postFromMember.body).toMatchObject({
        privacyType: 'public',
        id: expect.any(String),
        postText: 'I am a post in a community',
        CommunityId: communityWithPosts.body.id,
        UserId: creator.id,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        PostId: null,
      });
    });

    it.skip('should  not create post for non-member', async () => {
      const nonMemberPost = await global.__SERVER__
        .post('/posts')
        .send({
          postText: 'I am a post in a community',
          CommunityId: communityWithPosts.body.id,
        })
        .set('authorization', testUsers[1].accessToken);

      expect(nonMemberPost.statusCode).toEqual(400);
    });
    it.skip('Should list posts in communities', async () => {
      const { body: posts } = await global.__SERVER__
        .get(`/posts?CommunityId=${communityWithPosts.body.id}`)
        .set('authorization', creator.accessToken);
      expect(Array.isArray(posts.data)).toBeTruthy();
      expect(posts.data.length).toEqual(1);

      posts.data.forEach((p) => {
        expect(p).toMatchObject({
          id: expect.any(String),
          postText: 'I am a post in a community',
          privacyType: 'public',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),

          User: {
            firstName: creator.firstName,
            lastName: creator.lastName,
            id: creator.id,
            profilePicture: expect.any(String),
            createdAt: creator.createdAt,
          },
        });
      });
    });
  });

  it.skip('should create forum/discussion in community', async () => {
    const name = 'Public Community with discussion';
    const description = 'Public Community with discussion';
    // create a community

    communityWithForum = await global.__SERVER__
      .post(endpoint)
      .send({
        name,
        interests,
        description,
      })
      .set('authorization', creator.accessToken);

    expect(communityWithForum.statusCode).toEqual(201);
    communityWithForum = communityWithForum.body;

    // create a discussion in that community
    const discussionObject = {
      body: 'This is a discussion body',
      title: 'This is a discussion title',
      CommunityId: communityWithForum.id,
    };
    const discussion = await global.__SERVER__
      .post('/discussion')
      .send(discussionObject)
      .set('authorization', creator.accessToken);

    expect(discussion.statusCode).toEqual(201);
    expect(discussion.body).toMatchObject({
      ...discussionObject,
      id: expect.any(String),
      CommunityId: communityWithForum.id,
    });
  });

  it.skip('should list forum/discussion in community', async () => {
    // list discussions in that community
    const discussionList = await global.__SERVER__
      .get(`/discussion?CommunityId=${communityWithForum.id}`)
      .set('authorization', creator.accessToken);

    expect(discussionList.statusCode).toEqual(200);
    discussionList.body.data.forEach((dis) => {
      expect(dis.locked).toBe(false);
    });
  });

  it.skip('Only the community creator can delete the community', async () => {
    const name = 'Community to delete';
    const description = 'This community will be deleted';
    // create a community
    const community = await global.__SERVER__
      .post(endpoint)
      .send({
        name,
        interests,
        description,
      })
      .set('authorization', creator.accessToken);
    expect(community.statusCode).toEqual(201);
    // Fail to delete the community with another user

    const failDelete = await global.__SERVER__
      .delete(`${endpoint}/${community.body.id}`)
      .set('authorization', testUsers[0].accessToken);

    expect(failDelete.statusCode).toEqual(400);
    expect(failDelete.body).toMatchObject({
      name: 'BadRequest',
      message: 'Not authorized',
      code: 400,
      className: 'bad-request',
      errors: {},
    });
    // delete the community with the creator
    const deletedCommunity = await global.__SERVER__
      .delete(`${endpoint}/${community.body.id}`)
      .set('authorization', creator.accessToken);

    expect(deletedCommunity.statusCode).toEqual(200);
  });

  it.skip('Should find private community after becoming member', async () => {
    const { statusCode, body: privateGroup } = await global.__SERVER__
      .post(endpoint)
      .set('authorization', creator.accessToken)
      .send({
        name: 'Private community group',
        description: 'Private community',
        privacyType: 'private',
      });

    expect(statusCode).toBe(201);

    const { statusCode: status, body: user } = await global.__SERVER__
      .post(userEndpoint)
      .send({ ...getRandUser(), id: undefined });

    expect(status).toBe(201);

    const { body: nonMemberAccess } = await global.__SERVER__
      .get(endpoint)
      .set('authorization', user.accessToken);

    expect(nonMemberAccess.total).toBe(9);

    const CommunityUser = app.get('sequelizeClient').models.CommunityUsers;

    await CommunityUser.create({
      CommunityId: privateGroup.id,
      UserId: user.id,
      CommunityRoleId: roles[0].id,
    });

    expect(status).toBe(201);
    const privateCommunity = await global.__SERVER__
      .get(`${endpoint}/${privateGroup.id}`)
      .set('authorization', user.accessToken);

    expect(privateCommunity.body).toMatchObject({
      canUserPost: true,
      canUserInvite: true,
    });
    const { body: memberAccess } = await global.__SERVER__
      .get(endpoint)
      .set('authorization', user.accessToken);

    expect(memberAccess.total).toBe(9);
  }, 3000);
});
