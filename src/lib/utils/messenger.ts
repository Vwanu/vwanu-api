/* eslint-disable no-underscore-dangle */
import {createLogger} from './logger';
const Logger = createLogger('Messenger');
import { Application } from '../../declarations';
import Notifier from './notifier/not';
import { EmailerService } from './outReach';

import getTemplate from './getTemplate';
// import sanitizeUserFor3rdParty from './sanitizer/sanitizerFor3rdParty';
import { NotifierOptions, IMessenger } from '../../schema/email.schema';

// _____

// Custom dependencies
// import TwilioMessenger from './texter/twillioMessenger'
// ____/

const TexterService = (): IMessenger => {
  return {
    send: (to: string, message: string, subject: string) => Promise.resolve({ ok: true }),
    sendTemplate: (to: string, templateId: string, data: any) => Promise.resolve({ ok: true })
  };
};

const defaultNotifierOptions: NotifierOptions = {
  source: 'email',
};

const createMessage = (template: any, user: any) =>
  template.template_body.replace('{verificationCode}', user.verificationCode);

export default function (app: Application) {
  const getMessageTemplateFunction = getTemplate(app);
  return {
    notifier: async (
      type,
      user,
      options: NotifierOptions = defaultNotifierOptions
    ) => {
      try {
        const template: any = await getMessageTemplateFunction(type, options);

        if (!template) {
          Logger.error(`${type} template not found`);
          throw new Error(`${type}  template not found`);
        }

        const notifierInstance =
          options.source === 'email'
            ? new Notifier(EmailerService())
            : new Notifier(TexterService());

        if (options.source === 'sms') {
          const message = createMessage(template, user);
          return await notifierInstance.send(user.phone, message, '');
        }
        const sanitizedUser = user; //sanitizeUserFor3rdParty(user);
        const { email: to } = sanitizedUser;
        return await notifierInstance.sendTemplate(
          to,
          template?.id,
          sanitizedUser
        );
      } catch (error) {
        Logger.error( 'Unknown error in notifier', error);
        throw error;
      }
    },
  };
}
