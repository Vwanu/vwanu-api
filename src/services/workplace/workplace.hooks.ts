import { requireAuth } from '../../Hooks/requireAuth';
import PatchWorkplace from './hooks/EditWorkplace.hook';
import RemoveWorkplace from './hooks/RemoveWorkplace.hook';


export default {
  before: {
    all: requireAuth,
    patch: PatchWorkplace,
    remove: RemoveWorkplace,
  },
};
