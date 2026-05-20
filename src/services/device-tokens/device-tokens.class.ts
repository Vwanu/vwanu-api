import { Params, Id } from '@feathersjs/feathers';
import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors';

import { Application } from '../../declarations';
import { DeviceToken, DevicePlatform } from '../../database/device-token';

// Match the pattern used elsewhere in the codebase (followers.class.ts) for
// detecting unique-constraint violations without depending on a typed import
// from sequelize, whose UniqueConstraintError export isn't picked up by the
// project's TypeScript setup.
const isUniqueConstraintError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  (err as { name?: string }).name === 'SequelizeUniqueConstraintError';

export interface CreateDeviceTokenInput {
  token: string;
  platform: DevicePlatform;
}

export interface DeviceTokenResponse {
  id: string;
  userId: string;
  token: string;
  platform: DevicePlatform;
  lastSeenAt: Date;
}

const VALID_PLATFORMS: ReadonlyArray<DevicePlatform> = ['ios', 'android'];

/**
 * Service for managing Expo push tokens (VWA-139).
 *
 * Critical behavior: the `token` column has a UNIQUE constraint (one device,
 * one owner). `create()` upserts on the token — if the token already exists
 * under a different `user_id`, ownership is reassigned to the authenticated
 * caller (this is the shared-device signin handoff).
 *
 * Without this reassignment, a family iPad shared between two accounts would
 * silently deliver User A's pushes to whoever's currently signed in.
 */
export class DeviceTokensService {
  app: Application;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(app: Application) {
    this.app = app;
  }

  /**
   * POST /device-tokens — idempotent upsert.
   * - Same user, same token → bumps last_seen_at, no new row.
   * - Same token, different user → UPDATEs user_id (signin handoff).
   * - New token → INSERT.
   */
  async create(
    data: CreateDeviceTokenInput,
    params: Params,
  ): Promise<DeviceTokenResponse> {
    const userId = params?.User?.id;
    if (!userId) throw new Forbidden('Authenticated user required');

    this.validateInput(data);

    // Try to find an existing row by token (UNIQUE index makes this fast).
    // @ts-ignore sequelize-typescript static methods not exposed on the type
    let row: DeviceToken | null = await DeviceToken.findOne({
      where: { token: data.token },
    });

    if (row) {
      // Update ownership + platform + last_seen_at. Idempotent if same user.
      row.userId = userId;
      row.platform = data.platform;
      row.lastSeenAt = new Date();
      // @ts-ignore sequelize-typescript instance methods not exposed on the type
      await row.save();
    } else {
      try {
        // @ts-ignore sequelize-typescript static methods not exposed on the type
        row = await DeviceToken.create({
          userId,
          token: data.token,
          platform: data.platform,
          lastSeenAt: new Date(),
        });
      } catch (err) {
        // Race condition: another request inserted the same token between our
        // findOne and create. Re-fetch + update.
        if (isUniqueConstraintError(err)) {
          // @ts-ignore sequelize-typescript static methods not exposed on the type
          row = await DeviceToken.findOne({ where: { token: data.token } });
          if (row) {
            row.userId = userId;
            row.platform = data.platform;
            row.lastSeenAt = new Date();
            // @ts-ignore sequelize-typescript instance methods not exposed on the type
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

  /**
   * DELETE /device-tokens/:token — revoke. Only deletes rows owned by the
   * authenticated user. Returns NotFound if the row doesn't exist or
   * belongs to a different user (we deliberately don't reveal which).
   */
  async remove(id: Id, params: Params): Promise<DeviceTokenResponse> {
    const userId = params?.User?.id;
    if (!userId) throw new Forbidden('Authenticated user required');

    if (typeof id !== 'string' || id.length === 0) {
      throw new BadRequest('Token is required in the URL path');
    }

    // @ts-ignore sequelize-typescript static methods not exposed on the type
    const row: DeviceToken | null = await DeviceToken.findOne({
      where: { token: id, userId },
    });

    if (!row) {
      throw new NotFound('Device token not found for this user');
    }

    // @ts-ignore sequelize-typescript instance methods not exposed on the type
    await row.destroy();
    return this.serialize(row);
  }

  // ---- helpers ----

  private validateInput(data: unknown): asserts data is CreateDeviceTokenInput {
    if (!data || typeof data !== 'object') {
      throw new BadRequest('Request body must be a JSON object');
    }
    const body = data as Partial<CreateDeviceTokenInput>;
    if (typeof body.token !== 'string' || body.token.length === 0) {
      throw new BadRequest('token is required');
    }
    if (!body.platform || !VALID_PLATFORMS.includes(body.platform)) {
      throw new BadRequest(
        `platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
      );
    }
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
