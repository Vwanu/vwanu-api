import updateTheTSVector from '../../search/tsquery-and-search.hook';
import { User } from '../../../database/user';

// Export the configured hook directly
export default updateTheTSVector({
  model: User,
  searchColumn: 'search_vector',
});
