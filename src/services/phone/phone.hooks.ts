import { disallow } from 'feathers-hooks-common';
import { requireAuth } from '../../Hooks/requireAuth';

import AutoOwn from '../../Hooks/AutoOwn'
import sendVerificationCode from './hooks/sendVerificationCode';


const notAllow = disallow('external');



export default {
  before: {
    all: [requireAuth, AutoOwn],
    get: notAllow,
    update: notAllow,// only his own phone number 
    patch: [AutoOwn],// todo only his own phone number 
    remove: notAllow,// only his own phone number 
  },

  after: {
    create: sendVerificationCode({ successMessage: 'Verification code sent successfully' })
  }
};
