/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';

describe("Conversations service", () => {

  it('registered the service', () => {
    const service = global.__APP__.service('conversation');
    expect(service).toBeTruthy();
  });

  it('Should be able to create a direct conversation', async () => {

    const [user1, ...users] = await global.__getRandUsers(3);
    await global.__SERVER__
      .post('/conversation')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        userIds: users.map((user) => user.id),
      }).expect(StatusCodes.CREATED);

  });


  it('should not create a second conversation with the same users', async () => {
    const [user1, user2] = await global.__getRandUsers(2);
    const convo1 = await global.__SERVER__
      .post('/conversation')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        userIds: [user2.id],
      }).expect(StatusCodes.CREATED);

    await global.__SERVER__
      .post('/conversation')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        userIds: [user2.id],
      })
      .expect(StatusCodes.CREATED)
      .expect((res) => {
        expect(res.body.id).toBe(convo1.body.id);
      });

    await global.__SERVER__
      .post('/conversation')
      .set('Authorization', `Bearer ${user2.accessToken}`)
      .send({
        userIds: [user1.id],
      }).expect(StatusCodes.CREATED).
      expect((res) => {
        expect(res.body.id).toBe(convo1.body.id);
      });

  });

  it('Should list all conversation created or part of via the conversation endpoint', async () => {

    const [user1, user2, user3] = await global.__getRandUsers(3);

    await global.__SERVER__
      .post('/conversation')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({ userIds: [user2.id] })
      .expect(StatusCodes.CREATED)

    await global.__SERVER__
      .post('/conversation')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({ userIds: [user3.id] })
      .expect(StatusCodes.CREATED)

    await global.__SERVER__
      .get('/conversation')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(StatusCodes.OK)
      .expect((res) => {
        expect(res.body.data.length).toBe(2);
      });


    await global.__SERVER__
      .get('/conversation')
      .set('Authorization', `Bearer ${user2.accessToken}`)
      .expect(StatusCodes.OK)
      .expect((res) => {
        expect(res.body.data.length).toBe(1);
      });

    await global.__SERVER__
      .get('/conversation')
      .set('Authorization', `Bearer ${user3.accessToken}`)
      .expect(StatusCodes.OK)
      .expect((res) => {
        expect(res.body.data.length).toBe(1);
      });


  });



  it('should be able to fetch one conversation', async () => {

    const [user1, user2] = await global.__getRandUsers(2);
    const convo = await global.__SERVER__
      .post('/conversation')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({ userIds: [user2.id] })
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .get(`/conversation/${convo.body.id}`)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(StatusCodes.OK)
      .expect((res) => {
        expect(res.body.id).toBe(convo.body.id);
      });
  });

  it('Only users of a conversation should fetch it', async () => {
    const [user1, user2, user3] = await global.__getRandUsers(3);

    const convo = await global.__SERVER__
      .post('/conversation')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({ userIds: [user2.id] })
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .get(`/conversation/${convo.body.id}`)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(StatusCodes.OK);

    await global.__SERVER__
      .get(`/conversation/${convo.body.id}`)
      .set('Authorization', `Bearer ${user2.accessToken}`)
      .expect(StatusCodes.OK);

    return global.__SERVER__
      .get(`/conversation/${convo.body.id}`)
      .set('Authorization', `Bearer ${user3.accessToken}`)
      .expect(StatusCodes.NOT_FOUND);

  });

});


/**
 * 
 * 
 *  it('Should create a new message in a conversation', async () => {
    publicConversation = await createConversation(
      [randomUser2.id],
      randomUser1
    );

    const newMessage = {
      messageText: 'test message',
      ConversationId: publicConversation.ConversationId,
    };

    const response: any = await Promise.all(
      [1, 2].map((msg) =>
        testServer
          .post('/message')
          .send({ ...newMessage, messageText: newMessage.messageText + msg })
          .set('authorization', randomUser1.accessToken)
      )
    );

    response.forEach(({ body: message }, idx) => {
      expect(message).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          received: false,
          read: false,
          messageText: `test message${idx + 1}`,
          ConversationId: publicConversation.ConversationId,
          createdAt: expect.any(String),
          receivedDate: null,
          readDate: null,
        })
      );
    });
  });
  it('should be able to fetch one conversation and see last message it contains', async () => {
    const { body: fetchedConversation } = await testServer
      .get(`${endpoint}/${publicConversation.ConversationId}`)
      .set('authorization', randomUser2.accessToken);

    expect(fetchedConversation).toMatchObject({
      id: publicConversation.ConversationId,
      amountOfPeople: 2,
      type: 'direct',
      name: null,
      amountOfMessage: 2,
      amountOfUnreadMessages: 2,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      Users: expect.any(Array),
      lastMessage: {
        id: expect.any(String),
        messageText: 'test message2',
        senderId: expect.any(String),
        read: false,
        received: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ConversationId: publicConversation.ConversationId,
        readDate: null,
        receivedDate: null,
      },
    });
    const { Users } = fetchedConversation;
    expect(Users.some((User) => User.id === randomUser1.id)).toBeTruthy();
    expect(Users.some((User) => User.id === randomUser2.id)).toBeTruthy();
  });

  it('When a conversation is fetch it should tell the requester his amount of unread messages', async () => {
    let conversations = await Promise.all(
      [randomUser1.accessToken, randomUser2.accessToken].map((participant) =>
        testServer
          .get(`${endpoint}/${publicConversation.ConversationId}`)
          .set('authorization', participant)
      )
    );
    conversations = conversations.map((conversation) => conversation.body);

    // Because the messages where sent by user 1
    const [user1Conversation, user2Conversation] = conversations;
    expect(user1Conversation.amountOfUnreadMessages).toBe(0);
    expect(user2Conversation.amountOfUnreadMessages).toBe(2);
  });
  it('user should fetch all message of a conversation', async () => {
    const messages = await testServer
      .get(`/message/?ConversationId=${publicConversation.ConversationId}`)
      .set('authorization', randomUser1.accessToken);

    expect(Array.isArray(messages.body.data)).toBeTruthy();
    expect(
      messages.body.data.every(
        (message) =>
          message.ConversationId === publicConversation.ConversationId
      )
    ).toBeTruthy();

    messages.body.data.forEach((message) => {
      expect(message).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          received: false,
          read: false,
          messageText: expect.any(String),
          ConversationId: publicConversation.ConversationId,
          createdAt: expect.any(String),
          receivedDate: null,
          readDate: null,
        })
      );
    });
  });
 */