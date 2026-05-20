import { disallow } from 'feathers-hooks-common';

import validateResource from '../../Hooks/validateResource';
import { createDeviceTokenSchema } from '../../schema/device-token.schema';

export default {
  before: {
    find: [disallow('external')],
    get: [disallow('external')],
    create: [validateResource(createDeviceTokenSchema)],
    update: [disallow('external')],
    patch: [disallow('external')],
  },
};
