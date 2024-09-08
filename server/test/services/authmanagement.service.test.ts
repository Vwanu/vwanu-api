import { StatusCodes } from 'http-status-codes';
import { randomBytes } from 'crypto';
// import notifier from '../../lib/utils/messenger';
// import notifier from '../src/lib/utils/messenger';
jest.mock('../../src/lib/utils/messenger');

let act: string;
const endpoint = '/authmanagement';
const testServer = global.__SERVER__;


describe('/authmanagement service', () => {

  describe('Service running', () => {


    it('service is running', () => {
      const service = global.__APP__.service('authmanagement');
      expect(service).toBeDefined();
    });


  });
  describe('check unique', () => {

    it('Should return an error if an action is not provided', async () => {
      const [user] = await global.__getRandUsers(1);
      return testServer
        .post(endpoint)
        .send({})
        .set('authorization', user.accessToken)
        .expect(StatusCodes.BAD_REQUEST)
    });


    it('should  return `not a unique value`', async () => {
      const [user] = await global.__getRandUsers(1);
      return testServer
        .post(endpoint)
        .send({ action: 'checkUnique', value: { email: user.email } })
        .expect(StatusCodes.BAD_REQUEST)
        .expect((response) => {
          expect(response.body.message.toLowerCase()).toContain('taken')
        })

    });

    it('should return an empty object indicating email is not taken', async () =>
      testServer
        .post(endpoint)
        .send({
          action: 'checkUnique',
          value: { email: `${randomBytes(5).toString('hex')}@email.com` },
        })
        .expect(StatusCodes.NO_CONTENT)
        .expect((response) => {
          expect(response.body).toEqual({})
        })

    );
  });

  describe('resendVerifySignup', () => {


    it('should change the user activation key and send a notification', async () => {

      const [user] = await global.__getRandUsers(1);
      const userR: any = await global.__SEQUELIZE__
        .models
        .User
        .findOne({ where: { email: user.email } });

      const oldActivationKey = userR.activationKey;


      await testServer
        .post(endpoint)
        .send({
          action: 'resendVerifySignup',
          value: { email: user.email },
        })
        .set('authorization', user.accessToken)
        .expect(StatusCodes.CREATED);

      await userR.reload();

      expect(userR.activationKey).toEqual(expect.any(String));
      expect(userR.activationKey).not.toEqual(oldActivationKey);
      expect(userR.verified).toBe(false);
    });
  });
  describe('verifySignupLong', () => {
    it('Should not verify with the wrong activation code ', async () => {
      const [user] = await global.__getRandUsers(1);
      return testServer
        .post(endpoint)
        .send({
          action: 'verifySignupLong',
          value: Math.random().toString(36).substring(7),
        })
        .set('authorization', user.accessToken)
        .expect(StatusCodes.BAD_REQUEST);

    });

    it('should verify signup for emails and send the email ', async () => {
      const [user] = await global.__getRandUsers(1);
      const u = await global.__SEQUELIZE__.models.User.findOne({ where: { email: user.email } });

      const { activationKey } = u;
      act = activationKey;
      const response = await testServer
        .post(endpoint)
        .send({
          action: 'verifySignupLong',
          value: activationKey,
        })
        .set('authorization', user.accessToken);

      // TODO: verify the email was sent
      const fetchUser = await global.__SEQUELIZE__
        .models
        .User
        .findOne({ where: { email: user.email } });

      expect(fetchUser.activationKey).toBe(null);
      expect(response.body.verified).toBe(true);
    });

    it('should not verify signup a second time ', async () => {
      const [user] = await global.__getRandUsers(1);
      return testServer
        .post(endpoint)
        .send({
          action: 'verifySignupLong',
          value: act,
        })
        .set('authorization', user.accessToken)
        .expect(StatusCodes.BAD_REQUEST);


    });
  });
  describe('sendResetPwd', () => {
    it('should not send reset password email when the user is unverified', async () => {

      const [unverifiedUser] = await global.__getRandUsers(1);

      return testServer
        .post(endpoint)
        .send({
          action: 'sendResetPwd',
          value: { email: unverifiedUser.email },
        }).set('authorization', unverifiedUser.accessToken)
        .expect(StatusCodes.BAD_REQUEST)
        .expect((response) => {
          expect(response.body.message).toContain('verified');
        });



    });

    it('should send reset password email', async () => {
      const [user] = await global.__getRandUsers(1);
      const u = await global.__SEQUELIZE__.models.User.findOne({ where: { email: user.email } });
      u.verified = true;
      await u.save();

      return testServer.post(endpoint).send({
        action: 'sendResetPwd',
        value: { email: user.email },
      }).expect(StatusCodes.CREATED);

    });
  });

  describe('resetPwdWithLongToken', () => {
    it('Should not change password before password reset request', async () => {
      const [user] = await global.__getRandUsers(1);

      return testServer
        .post(endpoint)
        .send({
          action: 'resetPwdLong',
          value: {
            token: Math.random().toString(36).substring(7),
            password: Math.random().toString(36).substring(7)
          },
        })
        .set('authorization', user.accessToken)
        .expect(StatusCodes.BAD_REQUEST)


    }

    );
    it('should not change the password with the wrong resetpassword token', async () => {

      const [user] = await global.__getRandUsers(1);
      const u = await global.__SEQUELIZE__.models.User.findOne({ where: { email: user.email } });
      u.verified = true;
      await u.save();


      await testServer.post(endpoint).send({
        action: 'sendResetPwd',
        value: { email: user.email },
      }).set('authorization', user.accessToken)
        .expect(StatusCodes.CREATED);


      testServer
        .post(endpoint)
        .send({
          action: 'resetPwdLong',
          value: {
            token: Math.random().toString(36).substring(7),
            password: Math.random().toString(36).substring(7)
          },
        })
        .expect(StatusCodes.BAD_REQUEST)

    }
    );

    it('should  change the password', async () => {

      const [user] = await global.__getRandUsers(1);
      const u = await global.__SEQUELIZE__.models.User.findOne({ where: { email: user.email } });
      u.verified = true;
      await u.save();


      await testServer.post(endpoint).send({
        action: 'sendResetPwd',
        value: { email: user.email },
      }).set('authorization', user.accessToken)
        .expect(StatusCodes.CREATED);

      await u.reload();

      const oldPassword = u.password;
      const newPassword = Math.random().toString(36).substring(7);



      await testServer
        .post(endpoint)
        .send({
          action: 'resetPwdLong',
          value: {
            token: u.resetPasswordKey,
            password: newPassword
          },
        }).set('authorization', user.accessToken)
        .expect(StatusCodes.CREATED)



      await u.reload();
      expect(u.password).not.toEqual(oldPassword);



    }
    );


  });
});
