import { requireAuth } from '../../Hooks/requireAuth';
import saveMedia from '../../Hooks/SaveProfilePictures.hooks';

import AgeAllow from '../../Hooks/AgeAllow';



export default {
  before: {
    all: [requireAuth, AgeAllow],
    find: [],
    get: [],
    create: [saveMedia(['original'])],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
