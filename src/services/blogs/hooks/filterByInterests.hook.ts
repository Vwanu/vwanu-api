// ignbore
// import { Op } from '@sequelize/core';
import { HookContext } from '@feathersjs/feathers';

const filterByInterests = (context: HookContext): HookContext => {
  const query = context.params.query || {};
  const raw = query.interestIds ?? context.params.interestIds;
  if (!raw) return context;

  const interestIds = Array.isArray(raw) ? raw : [raw];

  // Remove from query so feathers-sequelize doesn't treat it as a column filter
  if (context.params.query) {
    delete context.params.query.interestIds;
    delete context.params.query.interests;
    delete context.params.interestId;
  }

  // Inject a where clause into the existing Interest include added by AddInterests
  const sequelize = context.params.sequelize || {};
  const include = sequelize.include || [];

  const interestInclude = include.find((i: any) => i.as === 'interests');
  if (interestInclude) {
    interestInclude.where = { id: interestIds[0]  };
    interestInclude.required = true; // INNER JOIN — only blogs with these interests
  }

  context.params.sequelize = sequelize;
  return context;
};

export default filterByInterests;
