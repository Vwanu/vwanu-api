import { z, object, string, TypeOf } from 'zod';

export const devicePlatform = z.enum(['ios', 'android']);
export type DevicePlatform = TypeOf<typeof devicePlatform>;

export const DeviceTokenSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  token: z.string().min(1),
  platform: devicePlatform,
  lastSeenAt: z.date().or(z.string()),
  createdAt: z.date().or(z.string()).optional(),
});

export type DeviceTokenInterface = TypeOf<typeof DeviceTokenSchema>;

export const createDeviceTokenSchema = object({
  body: object({
    token: string({
      error: (iss) =>
        iss.input === undefined ? 'token is required' : 'token must be a string',
    }).min(1, 'token must not be empty'),
    platform: devicePlatform,
  }),
});
export type CreateDeviceTokenInput = TypeOf<typeof createDeviceTokenSchema>;
export type CreateDeviceTokenBody = z.infer<typeof createDeviceTokenSchema>['body'];

export const deleteDeviceTokenSchema = object({
  params: object({
    token: string({
      error: (iss) =>
        iss.input === undefined ? 'token is required in the URL path' : 'token must be a string',
    }).min(1),
  }),
});
export type DeleteDeviceTokenInput = TypeOf<typeof deleteDeviceTokenSchema>;

export const DeviceTokenResponseSchema = DeviceTokenSchema.omit({ createdAt: true });
export type DeviceTokenResponse = TypeOf<typeof DeviceTokenResponseSchema>;
