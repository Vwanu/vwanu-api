import NestedPath from '../../Hooks/NestedPath';
import { OnlyNotResponded , IncludeGuests, AssignHost} from './hook';

export default {
  before: {
    find: [ NestedPath, OnlyNotResponded,IncludeGuests],
    create: AssignHost,
    remove: NestedPath,
  },

  after: {
    // create: [NotifyInvitation],
  },

};
