/* eslint-disable import/prefer-default-export */
import { Params } from '@feathersjs/feathers';
import { BadRequest, NotFound, GeneralError } from '@feathersjs/errors';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { StatusCodes } from 'http-status-codes';

import { Application } from '../../declarations';
import notifier from '../../lib/utils/messenger';



const sendVerificationCode = async (phoneNumber, verificationCode) => {
  console.log({ phoneNumber, verificationCode })
};

const statusMessages = {
  successFullPhoneVerifcation: "Phone number added successfully. Verification code sent."
}
export class Phone extends Service {
  app;

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  // POST: Add a new phone or verify an existing one
  async create(data, params: Params) {
    const sequelize = this.app.get('sequelizeClient');

    if (params?.query && params?.query?.verify) {
      // Handle verification logic
      const { verificationCode } = params.query;
      const { userId, phoneNumber } = data;
      return sequelize.query(
        'SELECT verify_phone_code(:userId, :phoneNumber, :verificationCode) AS status',
        {
          replacements: { userId, phoneNumber, verificationCode },
          type: sequelize.QueryTypes.SELECT
        }
      ).then(result => result[0])
        .catch(err => { throw new BadRequest(err.message); });
    }
    console.log('not reading query')
    // Handle adding a new phone
    const { UserId: userId, phoneNumber, countryCode } = data;
    console.log({ userId, phoneNumber, countryCode })
    return sequelize.query(
      'SELECT add_or_associate_phone(:userId, :phoneNumber, :countryCode) AS verificationCode',
      {
        replacements: { userId, phoneNumber, countryCode },
        type: sequelize.QueryTypes.SELECT
      }
    ).then(result =>
      notifier(this.app).notifier('phoneVerificationCode', { phoneNumber, verificationCode: result[0].verificationCode }, { source: 'sms' }).then(() =>
        ({ message: statusMessages.successFullPhoneVerifcation })).catch(err => { throw new GeneralError(err.message); })
    )
      .catch(err => {

        const Err = err.code === StatusCodes.INTERNAL_SERVER_ERROR ? GeneralError : BadRequest;

        throw new Err((err.message))
      });

  }

  // GET: Retrieve phone details
  async find(params: Params) {
    const { sequelize } = this.app.get('sequelizeClient');
    const { userId, phoneNumber } = params.query;
    return sequelize.query(
      'SELECT * FROM get_phone_details(:userId, :phoneNumber)',
      {
        replacements: { userId, phoneNumber },
        type: sequelize.QueryTypes.SELECT
      }
    ).then(result => result[0])
      .catch(err => { throw new NotFound('Phone details not found.'); });
  }

  // PATCH: Update phone details
  async patch(id, data, params: Params) {
    const { sequelize } = this.app.get('sequelizeClient');
    const { userId, newPhoneNumber } = data;
    return sequelize.query(
      'SELECT update_primary_phone_if_primary(:userId, :newPhoneNumber) AS status',
      {
        replacements: { userId, newPhoneNumber },
        type: sequelize.QueryTypes.SELECT
      }
    ).then(result => result[0])
      .catch(err => { throw new BadRequest(err.message); });
  }

  // DELETE: Remove a phone association
  async remove(id, params: Params) {
    const { sequelize } = this.app.get('sequelizeClient');
    const { userId, phoneNumber } = params.query;
    return sequelize.query(
      'SELECT delete_phone_association(:userId, :phoneNumber) AS status',
      {
        replacements: { userId, phoneNumber },
        type: sequelize.QueryTypes.SELECT
      }
    ).then(result => result[0])
      .catch(err => { throw new BadRequest(err.message); });
  }
}
