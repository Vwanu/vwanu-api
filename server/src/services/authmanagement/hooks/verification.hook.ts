import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import includes from 'lodash/includes';

/**
 * This is a verification hook that performs authentication checks before allowing certain actions.
 *
 * @param {HookContext} context - The hook context object.
 * @returns {HookContext} The modified hook context object.
 * @throws {BadRequest} Throws an error if the user values do not match the expected values or if the user is not authenticated.
 */


export default (context: HookContext): HookContext => {
  const { params, data } = context;
  const noVerify = [
    'checkUnique',
    'sendResetPwd',
    'passwordChange',
    'resendVerifySignup',
    'resetPwdLong',
  ];
  if (includes(noVerify, data.action)) return;

  if (!params.User)
    throw new BadRequest('Please authenticate to perform this action');
  const valid = includes(params.User, data.value);

  if (!valid) {
    // console.log({ valid, data, u: params.User.id });
    throw new BadRequest('User values do not match expected values.');
  }

  // eslint-disable-next-line consistent-return
  return context;
};
