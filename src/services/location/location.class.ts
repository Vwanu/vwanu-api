import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LocationClient, SearchPlaceIndexForSuggestionsCommand, SearchForSuggestionsResult } from '@aws-sdk/client-location';
import { BadRequest, GeneralError } from '@feathersjs/errors';

/**
 * AWS Location Service Setup Instructions:
 * 
 * 1. Create a Place Index in AWS Location Service:
 *    - Go to AWS Console > Location Service
 *    - Create a place index (name: 'places-index' or configure via options)
 *    - Choose a data provider (Esri, HERE, or Grab)
 *    - Note the index name and region
 * 
 * 2. Set Environment Variables:
 *    - AWS_ACCESS_KEY_ID: Your AWS access key
 *    - AWS_SECRET_ACCESS_KEY: Your AWS secret key
 * 
 * 3. Configure IAM Permissions:
 *    Required permissions for the AWS user/role:
 *    - geo:SearchPlaceIndexForSuggestions
 *    - geo:GetPlace (for future detailed place lookups)
 * 
 * 4. Usage:
 *    The service is automatically available at /location endpoint
 *    Example: GET /location?text=Brooklyn&maxResults=10
 */

interface PlaceSearchQuery {
  text: string;
  maxResults?: number;
  language?: string;
  countries?: string[];
  categories?: string[];
}

interface PlaceResult {
  text: string;
  placeId?: string;
  country?: string;
  region?: string;
  subRegion?: string;
  municipality?: string;
  postalCode?: string;
  addressNumber?: string;
  street?: string;
  categories?: string[];
  relevance?: number;
}



interface Data extends PlaceResult {
  id?: string | number;
}

interface ServiceOptions {
  indexName?: string;
  region?: string;
}

/**
 * AWS Location Service integration for place search and autocomplete functionality
 * 
 * This service provides autocomplete suggestions for places, cities, and countries
 * using AWS Location Service. 
 * 
 * Setup Requirements:
 * 1. AWS Location Service place index (default: 'places-index')
 * 2. Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 * 
 * Usage Examples:
 * 
 * Basic search:
 * GET /location?text=Brooklyn
 * 
 * With options:
 * GET /location?text=Brooklyn&maxResults=5&language=en&countries=USA
 * 
 * Response format:
 * [
 *   {
 *     "text": "Brooklyn, New York, USA",
 *     "placeId": "some-place-id",
 *     "categories": ["Municipality"]
 *   }
 * ]
 */
export class Location implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;
  private client: LocationClient;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = {
      indexName: process.env.AWS_PLACE_INDEX_NAME,
      region: process.env.AWS_REGION,
      ...options
    };
    this.app = app;
    
    // Initialize AWS Location Service client
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not found in environment variables');
    }
    this.client = new LocationClient({
      region: this.options.region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }

  private validateSearchQuery(query: Record<string, unknown>): PlaceSearchQuery {
    console.log('query>>>>>>>>>>>>>>>', Object.keys(query));
    if (!query || typeof query !== 'object') {
      throw new BadRequest('Invalid query parameters');
    }

    if (!query.text || typeof query.text !== 'string' || query.text.trim().length === 0) {
      throw new BadRequest('Search text is required and must be a non-empty string');
    }

    const maxResults = query.maxResults ? parseInt(query.maxResults as string) : 10;
    if (maxResults < 1 || maxResults > 50) {
      throw new BadRequest('maxResults must be between 1 and 50');
    }

    return {
      text: query.text.trim(),
      maxResults,
      language: (query.language as string) || 'en',
      countries: query.countries ? (Array.isArray(query.countries) ? query.countries as string[] : [query.countries as string]) : undefined,
      categories: query.categories ? (Array.isArray(query.categories) ? query.categories as string[] : [query.categories as string]) : undefined
    };
  }

  /**
   * Search for places using AWS Location Service
   * Query parameters:
   * - text: string (required) - The search text (e.g., "Brooklyn")
   * - maxResults: number (optional) - Maximum number of results (1-50, default: 10)
   * - language: string (optional) - Language code (default: 'en')
   * - countries: string[] (optional) - Country codes to filter results
   * - categories: string[] (optional) - Place categories to filter results
   */
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    try {
      if (!params?.query) {
        throw new BadRequest('Query parameters are required');
      }

      const searchQuery = this.validateSearchQuery(params.query);

      if (!this.options.indexName) {
        throw new BadRequest('AWS Location Service index name not configured');
      }

      const command = new SearchPlaceIndexForSuggestionsCommand({
        IndexName: this.options.indexName,
        Text: searchQuery.text,
        MaxResults: searchQuery.maxResults,
        Language: searchQuery.language,
        FilterCountries: searchQuery.countries,
        FilterCategories: searchQuery.categories
      });

      const response = await this.client.send(command);

      if (!response.Results) {
        return [];
      }
      console.log('response', response);

      const suggestions: Data[] = response.Results.map((result: SearchForSuggestionsResult) => {
        return {
          text: result.Text || '',
          placeId: result.PlaceId,
          categories: result.Categories || [],
          // AWS Suggestions API doesn't return detailed place information
          // Use GetPlace API with PlaceId for detailed information if needed
        };
      });

      return suggestions;

    } catch (error: unknown) {
      console.log('error', error);
      const awsError = error as { name?: string; message?: string };
      
      if (awsError.name === 'BadRequest') {
        throw error;
      }
      
      console.error('AWS Location Service Error:', error);
      
      if (awsError.name === 'ResourceNotFoundException') {
        throw new BadRequest('Location index not found. Please check your AWS Location Service configuration.');
      }
      
      if (awsError.name === 'AccessDeniedException') {
        throw new BadRequest('Access denied to AWS Location Service. Please check your credentials and permissions.');
      }
      
      throw new GeneralError('Failed to search locations', awsError);
    }
  }

  /**
   * Get detailed information about a specific place by PlaceId
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get (id: Id, params?: Params): Promise<Data> {
    throw new BadRequest('Get method not implemented. Use find method to search for places.');
  }

  /**
   * Create method not supported for location service
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: Data, params?: Params): Promise<Data> {
    throw new BadRequest('Create method not supported for location service');
  }

  /**
   * Update method not supported for location service
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    throw new BadRequest('Update method not supported for location service');
  }

  /**
   * Patch method not supported for location service
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    throw new BadRequest('Patch method not supported for location service');
  }

  /**
   * Remove method not supported for location service
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove (id: NullableId, params?: Params): Promise<Data> {
    throw new BadRequest('Remove method not supported for location service');
  }
}
