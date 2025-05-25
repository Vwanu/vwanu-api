import { Op } from '@sequelize/core';
import addAssociation from '../../Hooks/AddAssociations';

// import IncludeAssociations from '../../Hooks/IncludeAssociations';
import autoOwn from '../../Hooks/AutoOwn';
// import saveAndAssociateMedia from '../../Hooks/SaveAndAssociateMedia';

// const UserAttributes = [
//   'firstName',
//   'lastName',
//   'id',
//   'profilePicture',
//   'createdAt',
// ];

export default {
  before: {
    all: [
      addAssociation({
        models: [
          {
            model: 'users',
            attributes: [
              'firstName',
              'lastName',
              'id',
              'profilePicture',
              'createdAt',
            ],
          },
          {
            model: 'medias',
            as: 'Medias',
          },
        ],
      }),
    ],
    find: [],
    get: [],
    create: [autoOwn],
    update: [autoOwn],
    patch: [autoOwn],
    remove: [autoOwn],
  },

  after: {
    all: [],
    find: [],
    get: [
      async (context) => {
        const { models } = context.app.get('sequelizeClient');
        let MediasIds = await models.Album_Media.findAll({
          where: { AlbumId: context.id },
          attributes: ['MediumId'],
        });
        MediasIds = Array.from(
          new Set(MediasIds.map(({ MediumId }) => MediumId))
        );
        const Medias = await models.Media.findAll({
          where: { id: { [Op.in]: MediasIds } },
        });

        const { id, name, createdAt } = context.result;
        context.result = {
          ...{ id, name, createdAt },
          User: context.result.User.dataValues,
          Medias,
        };

        return context;
      },
    ],
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
