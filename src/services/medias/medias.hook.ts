
import saveMedia from '../../Hooks/SaveProfilePictures.hooks';

export default {
  before: {
 
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
