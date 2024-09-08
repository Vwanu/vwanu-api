import { StatusCodes } from 'http-status-codes';

describe("'message' service", () => {

  const endpoint = '/message';
  const conversationsEndpoint = '/conversation';


  it('registered the message service', () => {
    const service = global.__APP__.service('message');
    expect(service).toBeTruthy();
  });

  it('a user should be able to create a message in a conversation', async () => {
    const [user1, user2] = await global.__getRandUsers(2);
    const conversation = await global.__SERVER__
      .post(conversationsEndpoint)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        userIds: [user2.id],
      })
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .post(endpoint)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        messageText: 'test',
        ConversationId: conversation.body.id,
      })
      .expect(StatusCodes.CREATED);


    // expect(message).toMatchObject({
    //   id: expect.any(String),
    //   received: false,
    //   read: false,
    //   ConversationId: expect.any(String),
    //   messageText: 'test',
    //   senderId: user1.id,
    //   Media: [],
    //   updatedAt: expect.any(String),
    //   createdAt: expect.any(String),
    //   receivedDate: null,
    //   readDate: null,
    //   UserId: null,
    // });
  });

  it('a user should be able to pull all messages from a conversation', async () => {

    const [user1, user2] = await global.__getRandUsers(2);

    const conversation = await global.__SERVER__
      .post(conversationsEndpoint)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        userIds: [user2.id],
      })
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .post(endpoint)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        messageText: 'test',
        ConversationId: conversation.body.id,
      })
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .get(`${endpoint}?ConversationId=${conversation.body.id}`)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(StatusCodes.OK);



    // pulledMessages.forEach((msg) => {
    //   expect(msg).toMatchObject({
    //     id: expect.any(String),
    //     received: false,
    //     read: false,
    //     ConversationId: expect.any(String),
    //     messageText: 'test',
    //     senderId: testUsers[0].id,
    //     Media: [],
    //     updatedAt: expect.any(String),
    //     createdAt: expect.any(String),
    //     receivedDate: null,
    //     readDate: null,
    //     UserId: null,
    //   });
    // });
  });

  it('a user should be able pull a particular message', async () => {

    const [user1, user2] = await global.__getRandUsers(2);

    const conversation = await global.__SERVER__
      .post(conversationsEndpoint)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        userIds: [user2.id],
      })
      .expect(StatusCodes.CREATED);

    const message = await global.__SERVER__
      .post(endpoint)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        messageText: 'test',
        ConversationId: conversation.body.id,
      })
      .expect(StatusCodes.CREATED);


    await global.__SERVER__
      .get(`${endpoint}/${message.body.id}`)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(StatusCodes.OK);


    // expect(pulledMessage).toMatchObject({
    //   id: testMessages.id,
    //   messageText: 'test',
    //   received: false,
    //   read: false,
    //   receivedDate: null,
    //   readDate: null,
    //   createdAt: expect.any(String),
    //   updatedAt: expect.any(String),
    //   UserId: null,
    //   senderId: testUsers[0].id,
    //   ConversationId: testConversation.id,
    //   sender: expect.objectContaining({
    //     firstName: testUsers[0].firstName,
    //     lastName: testUsers[0].lastName,
    //     id: testUsers[0].id,
    //     profilePicture: expect.any(String),
    //     createdAt: expect.any(String),
    //   }),
    //   Conversation: expect.objectContaining({
    //     id: testConversation.id,
    //     amountOfPeople: 2,
    //     type: 'direct',
    //     name: null,
    //     amountOfMessages: 1,
    //     amountOfUnreadMessages: 1,
    //     createdAt: expect.any(String),
    //     updatedAt: expect.any(String),
    //   }),
    //   Media: [],
    // });
  }, 10000);

  it.todo('should be able to send media in a conversation');
  it('Should Mark Message as read, received, receivedDate, readDate are automatically set', async () => {

    const [user1, user2] = await global.__getRandUsers(2);

    const conversation = await global.__SERVER__
      .post(conversationsEndpoint)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        userIds: [user2.id],
      })
      .expect(StatusCodes.CREATED);

    const message = await global.__SERVER__
      .post(endpoint)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({
        messageText: 'test',
        ConversationId: conversation.body.id,
      })
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .patch(`${endpoint}/${message.body.id}`)
      .send({ read: true })
      .set('authorization', user2.accessToken)
      .expect(StatusCodes.OK);



    // let pulledUpdatedConversation = await testServer
    //   .get(`${endpoint}/${testMessages.id}`)
    //   .set('authorization', testUsers[1].accessToken);
    // pulledUpdatedConversation = pulledUpdatedConversation.body;

    // expect(pulledUpdatedConversation).toMatchObject({
    //   id: testMessages.id,
    //   messageText: 'test',
    //   received: true,
    //   read: true,
    //   receivedDate: expect.any(String),
    //   readDate: expect.any(String),
    //   createdAt: expect.any(String),
    //   updatedAt: expect.any(String),
    //   UserId: null,
    //   senderId: testUsers[0].id,
    //   ConversationId: testConversation.id,
    //   sender: {
    //     firstName: testUsers[0].firstName,
    //     lastName: testUsers[0].lastName,
    //     id: testUsers[0].id,
    //     profilePicture: expect.any(String),
    //     createdAt: expect.any(String),
    //   },
    //   Conversation: {
    //     id: testConversation.id,
    //     amountOfPeople: 2,
    //     type: 'direct',
    //     name: null,
    //     amountOfMessages: 1,
    //     amountOfUnreadMessages: 0,
    //     createdAt: expect.any(String),
    //     updatedAt: expect.any(String),
    //   },
    // });
  });
  it.todo('should be able to mark a conversation as read or received');

});
