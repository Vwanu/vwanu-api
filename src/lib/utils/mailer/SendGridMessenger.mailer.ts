// import sendGridMail, { MailDataRequired } from '@sendgrid/mail';

// Custom dependencies
import { IMessenger } from '../../../schema/email.schema';

export default class SendGridMessenger implements IMessenger {
  constructor(private apikey, private fromEmail) {
    this.apikey = apikey;
    this.fromEmail = fromEmail;
    // sendGridMail.setApiKey(this.apikey);
  }

  send = async (to: string, html: string, subject: string) =>
    new Promise<{ ok: boolean }>((resolve) => {
      const message = {
        from: this.fromEmail,
        to,
        html,
        subject,
      };
      console.log('send', to, html, subject, message);
      // sendGridMail
      //   .send(message as MailDataRequired)
      //   .then(() => {
      //     resolve({ ok: true });
      //   })
      //   .catch((error) => {
      //     reject(error);
      //   });
      resolve({ ok: true });
    });

  sendTemplate = async (to: string, templateId: string, customs: any) =>
    new Promise<{ ok: boolean }>((resolve) => {
      const message = {
        to,
        from: this.fromEmail,
        template_id: templateId,
        personalizations: [
          {
            to: [{ email: to }],
            dynamic_template_data: customs,
          },
        ],
      };
      console.log('sendTemplate', to, templateId, customs, message);
      resolve({ ok: true });
      // sendGridMail
      //   // @ts-ignore
      //   .send(message)
      //   .then(() => {
      //     resolve({ ok: true });
      //   })
      //   .catch((error) => {
      //     reject(error);
      //   });
    });
}
