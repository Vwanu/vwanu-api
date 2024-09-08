/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */

import { Application } from '../../../declarations';
// import Notifier from './notifier/not';
// import { EmailerService } from './outReach';

// import getTemplate from './getTemplate';
// import sanitizeUserFor3rdParty from './sanitizer/sanitizerFor3rdParty';
// import { NotifierOptions } from '../../schema/email.schema'

// _____

// Custom dependencies
// import TwilioMessenger from './texter/twillioMessenger'
// ____/



// const TexterService = (): IMessenger => {
//     console.log('')
//     // console.log('texterService')
//     // const { authToken, fromNumber, accountSid } = config.get<{ authToken: string, fromToken: string, accounsid: string }>('Texterconfiguration')
//     // console.log({ authToken, fromNumber, accountSid })
//     // const texter = new TwilioMessenger(authToken, fromNumber, accountSid)
//     // return texter;
//     return { send: () => Promise.resolve('message sent') } as IMessenger


// };

// const defaultNotifierOptions: NotifierOptions = {
//     source: 'email'
// }

// const createMessage = (template: any, user: any) => template.template_body.replace('{verificationCode}', user.verificationCode);



export default function (app: Application) {

    return {
        notifier: async (type, user, options: any) => Promise.resolve('message sent')

    };
}
