import { HookContext } from "@feathersjs/feathers";
import { Model } from "sequelize";

/**
 * Model reference type - supports both legacy string lookup and direct model class imports
 *
 * - string: Legacy service name lookup (e.g., 'users', 'medias')
 * - Model class: Direct model class import (e.g., User, Media) - PREFERRED for type safety
 */
type ModelReference = string | typeof Model | (new () => Model);

/**
 * Configuration for a single model association
 */
interface ModelAssociation {
  /**
   * The model to include in the query
   *
   * Can be either:
   * - A string service name (legacy, deprecated): 'users', 'medias', etc.
   * - A direct model class import (preferred): User, Media, etc.
   *
   * @example
   * // Legacy approach (deprecated)
   * { model: 'users' }
   *
   * @example
   * // Modern approach (preferred for type safety)
   * import { User } from '@root/database/user';
   * { model: User }
   */
  model: ModelReference;

  /**
   * Optional association alias
   * Used when the association has a custom name
   * @example { model: User, as: 'sender' }
   */
  as?: string;

  /**
   * Optional array of attribute names to include from the associated model
   * If not specified, all attributes are included
   * @example { model: User, attributes: ['id', 'firstName', 'lastName'] }
   */
  attributes?: string[];

  /**
   * Additional Sequelize include options
   * Supports nested includes, where clauses, etc.
   */
  [key: string]: any;
}

/**
 * Options for the AddAssociations hook
 */
interface AddAssociationsOptions {
  /**
   * Array of model associations to include in the query
   * Each entry configures a Sequelize include for eager loading related data
   */
  models: ModelAssociation[];
}

/**
 * AddAssociations Hook
 *
 * A FeathersJS before hook that adds Sequelize associations (includes) to service queries.
 * This enables eager loading of related data in a single database query.
 *
 * ## Features
 * - Supports both legacy string-based model lookup and modern direct class imports
 * - Type-safe when using direct model imports
 * - Configurable attribute selection for optimization
 * - Support for aliased associations
 * - Automatically sets `raw: false` for nested object output
 *
 * ## Usage
 *
 * ### Modern Approach (Preferred)
 * ```typescript
 * import { User } from '../../database/user';
 * import { CommunityRole } from '../../database/communityRole.model';
 * import addAssociation from '../../Hooks/AddAssociations';
 *
 * export default {
 *   before: {
 *     find: [
 *       addAssociation({
 *         models: [
 *           {
 *             model: User,
 *             attributes: ['firstName', 'lastName', 'id', 'profilePicture'],
 *           },
 *           {
 *             model: CommunityRole,
 *             as: 'role',
 *             attributes: ['name', 'id'],
 *           },
 *         ],
 *       }),
 *     ],
 *   },
 * };
 * ```
 *
 * ### Legacy Approach (Deprecated)
 * ```typescript
 * addAssociation({
 *   models: [
 *     { model: 'users', attributes: ['firstName', 'lastName'] },
 *   ],
 * })
 * ```
 *
 * ## Migration Guide
 *
 * To migrate from legacy string-based lookups to modern class imports:
 *
 * 1. Import the model class at the top of your hooks file:
 *    ```typescript
 *    import { User } from '../../database/user';
 *    ```
 *
 * 2. Replace the string with the class reference:
 *    ```typescript
 *    // Before
 *    { model: 'users' }
 *
 *    // After
 *    { model: User }
 *    ```
 *
 * ## Benefits of Direct Model Imports
 * - Full TypeScript type safety and IntelliSense support
 * - Compile-time error detection for typos and missing models
 * - Better IDE navigation (go-to-definition works)
 * - Eliminates runtime service lookup overhead
 * - Makes dependencies explicit and easier to track
 *
 * @param options - Configuration object with models array
 * @returns FeathersJS before hook function
 *
 * @throws {Error} If used in a hook type other than 'before'
 */
export default function (options: AddAssociationsOptions) {
  // eslint-disable-next-line no-param-reassign
  options.models = options.models || [];

  return (context: HookContext): HookContext => {
    // Ensure that this hook is only used in before hooks
    if (context.type !== 'before') {
      throw new Error('The addAssociations hook can only be used in a before hook.');
    }

    // Get existing sequelize options or create new object
    const sequelize = context.params.sequelize || {};
    const include = sequelize.include || [];

    // Transform model configurations and add to include array
    sequelize.include = include.concat(
      options.models.map((model) => {
        const newModel = { ...model };

        // Support both direct model class (modern) and service string lookup (legacy)
        if (typeof model.model === 'string') {
          // Legacy path: lookup model via service registry
          // This approach is deprecated but maintained for backward compatibility
          newModel.model = context.app.service(model.model).Model;
        } else {
          // Modern path: use direct model class reference
          // This provides type safety and better IDE support
          newModel.model = model.model;
        }

        return newModel;
      })
    );

    // Set raw: false to get nested objects instead of flat rows
    sequelize.raw = false;

    // Update context with modified sequelize options
    context.params.sequelize = sequelize;
    return context;
  };
}
