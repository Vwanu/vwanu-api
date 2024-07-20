/**
 * Adds associations to the Sequelize include property in the FeathersJS hook context.
 * @param options - The options object.
 * @returns The modified hook context.
 */
import { HookContext } from '@feathersjs/feathers';

export default function (options: any = {}) {
  // eslint-disable-next-line no-param-reassign
  options.models = options.models || [];

  return (context: HookContext): HookContext => {
    const sequelize = context.params.sequelize || {};
    const include = sequelize.include || [];

    //	Reasign in case we created these properties
    sequelize.include = include.concat(
      options.models.map((model) => {
        const newModel = { ...model };

        newModel.model = context.app.services[model.model].Model;

        return newModel;
      })
    );

    //	Nested output
    sequelize.raw = false;

    context.params.sequelize = sequelize;
    return context;
  };
}
