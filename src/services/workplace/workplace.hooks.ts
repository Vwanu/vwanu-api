
import PatchWorkplace from './hooks/EditWorkplace.hook';
import RemoveWorkplace from './hooks/RemoveWorkplace.hook';


export default {
  before: {
    patch: PatchWorkplace,
    remove: RemoveWorkplace,
  },
};
