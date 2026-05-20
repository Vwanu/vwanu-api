import { Params, Id } from '@feathersjs/feathers';
import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors';

import { Application } from '../../declarations';
import { DeviceToken } from '../../database/device-token';
import {
  CreateDeviceTokenBody,
  DeviceTokenResponse,
} from '../../schema/device-token.schema';

export type { CreateDeviceTokenBody, DeviceTokenResponse };

const isUniqueConstraintError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  (err as { name?: string }).name === 'SequelizeUniqueConstraintError';

export class DeviceTokensService {
  app: Application;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(app: Application) {
    this.app = app;
  }

  async create(
    data: CreateDeviceTokenBody,
    params: Params,
  ): Promise<DeviceTokenResponse> {
    const userId = params?.User?.id;
    if (!userId) throw new Forbidden('Authenticated user required');

    // @ts-ignore
    let row: DeviceToken | null = await DeviceToken.findOne({
      where: { token: data.token },
    });

    if (row) {
      row.userId = userId;
      row.platform = data.platform;
      row.lastSeenAt = new Date();
      // @ts-ignore
      await row.save();
    } else {
      try {
        // @ts-ignore
        row = await DeviceToken.create({
          userId,
          token: data.token,
          platform: data.platform,
          lastSeenAt: new Date(),
        });
      } catch (err) {
        if (isUniqueConstraintError(err)) {
          // @ts-ignore
          row = await DeviceToken.findOne({ where: { token: data.token } });
          if (row) {
            row.userId = userId;
            row.platform = data.platform;
            row.lastSeenAt = new Date();
            // @ts-ignore
            await row.save();
          }
        } else {
          throw err;
        }
      }
    }

    if (!row) {
      throw new BadRequest('Failed to register device token');
    }

    return this.serialize(row);
  }

  async remove(id: Id, params: Params): Promise<DeviceTokenResponse> {
    const userId = params?.User?.id;
    if (!userId) throw new Forbidden('Authenticated user required');

    if (typeof id !== 'string' || id.length === 0) {
      throw new BadRequest('Token is required in the URL path');
    }

    // @ts-ignore
    const row: DeviceToken | null = await DeviceToken.findOne({
      where: { token: id, userId },
    });

    if (!row) {
      throw new NotFound('Device token not found for this user');
    }

    // @ts-ignore
    await row.destroy();
    return this.serialize(row);
  }

  private serialize(row: DeviceToken): DeviceTokenResponse {
    return {
      id: row.id,
      userId: row.userId,
      token: row.token,
      platform: row.platform,
      lastSeenAt: row.lastSeenAt,
    };
  }
}
