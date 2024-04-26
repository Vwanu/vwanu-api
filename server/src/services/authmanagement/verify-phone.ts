/* eslint-disable no-unused-vars */
import { BadRequest } from '@feathersjs/errors';
import getUserData from '../../lib/utils/getUserData';
import { nanoid } from 'nanoid';

export async function requestPhoneVerification(
  options,
  identifyUser,
  notifierOptions = {}
) {
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;

  const users = await usersService.find({ query:identifyUser });
  const user1 = getUserData(users, ['phoneIsNotVerified']);
  // Todo check the phone belongs to the user 

  const updatedUser = await usersService.patch(
      user1[usersServiceIdName],{
      phoneVerified: false,
      phoneverificationExpires: Date.now() + options.delay,
      phoneActivationCode: nanoid(),
      }
    );

  try {
    await options.notifier('phoneVerification', user1,notifierOptions);
    return options.sanitizeUserForClient(updatedUser);
  } catch (error) {
    return {
      user: options.sanitizeUserForClient(updatedUser),
      error: error.message,
      extraMessage: 'The server failed to send the phone verification code',
    };
  }
}
export async function verifyPhoneWithShortToken  (
  options,
  query,
  tokens,
  notifierOptions = {}
) {
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;

  const users = await usersService.find({ query });

  const user1 = getUserData(users, [
    'isNotVerifiedOrHasVerifyChanges',
    'verifyNotExpired',
  ]);

  async function eraseVerifyProps(user, verified, verifyChanges = {}) {
    const patchToUser = {
      ...(verifyChanges || {}),
      verified,
      activationKey: null,
      shortActivationKey: null,
      verifyExpires: null,
      verifyChanges: {},
    };

    const result = await usersService.patch(
      user[usersServiceIdName],
      patchToUser,
      {}
    );
    return result;
  }

  if (!Object.keys(tokens).every((key) => tokens[key] === user1[key])) {
    await eraseVerifyProps(user1, user1.verified);

    throw new BadRequest('The token provided is incorrect');
  }

  const user2 = await eraseVerifyProps(user1, true, user1.verifyChanges || {});

  try {
    await options.notifier('phoneVerification', user2);
    return options.sanitizeUserForClient(user2);
  } catch (error) {
    return {
      user: options.sanitizeUserForClient(user2),
      error: error.message,
      extraMessage: 'The server failed to send the phone confirmation code',
    };
  }
}