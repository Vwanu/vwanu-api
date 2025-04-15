import { requireAuth } from '../../Hooks/requireAuth';



export default {
  before: {
    all: [requireAuth],
  },
};
