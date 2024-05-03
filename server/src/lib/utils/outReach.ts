/* eslint-disable import/prefer-default-export */
import config from 'config';

// Custom dependencies
import { IMessenger } from '../../schema/email.schema';
import TwilioMessenger from './texter/twillioMessenger'
import SendGridMessenger from './mailer/SendGridMessenger.mailer';

export const TexterService=():IMessenger=>{
  const {authToken,fromNumber,accountSid} = config.get<{authToken:string, fromToken:string,accounsid:string}>('Texterconfiguration')
  const texter = new TwilioMessenger(authToken,fromNumber,accountSid )
  return texter;
}

export const EmailerService = (): IMessenger => {
  const emailConfig = config.get('EmailerConfiguration');
  const messenger = new SendGridMessenger(
    emailConfig.api_key,
    emailConfig.from
  );
  return messenger;
};
