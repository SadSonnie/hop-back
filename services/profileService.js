const ApiError = require('../exceptions/apiError');
const { notFoundError } = require('../errorMessages');


const {Places, Tags, PlaceTags} = require('../models')

const getAllTags = async () => {
  const tagsAll = await Tags.findAll({
    include: [{
      model: PlaceTags,
      include: [{
        model: Places,
      }]
    }],
    order: [["createdAt", "DESC"]],
  });

  const transformData = tagsAll.map(tag => ({name: tag.name, count: tag.PlaceTags.length})).reduce((acc, item) => {
    acc[item.name] = item.count;
    return acc;
  }, {});

  return transformData
}

const createProfileService = async ({ placeId, tags }) => {
  try {
    const place = await Places.findByPk(placeId);
    if (!place) throw new Error('place');
    if (!(Array.isArray(tags) && tags?.length > 0)) throw new Error('tag');

    // Получить текущие теги для места
    const currentTags = await PlaceTags.findAll({
      where: { place_id: placeId },
      include: [
        {
          model: Tags,
          as: 'placesItems', 
          attributes: ['name'],
        },
      ],
    });

    const currentTagNames = currentTags.map((pt) => pt.placesItems.name);

    const tagsToAdd = tags.filter((tag) => !currentTagNames.includes(tag));
    const tagsToRemove = currentTagNames.filter((tag) => !tags.includes(tag));

    if (tagsToRemove.length > 0) {
      const tagsToRemoveIds = (
        await Tags.findAll({ where: { name: tagsToRemove } })
      ).map((tag) => tag.id);

      await PlaceTags.destroy({
        where: {
          place_id: placeId,
          tag_id: tagsToRemoveIds,
        },
      });
    }

    if (tagsToAdd.length > 0) {
      const newTagRecords = await Tags.findAll({ where: { name: tagsToAdd } });
      const placeTags = newTagRecords.map((tag) => ({
        tag_id: tag.id,
        place_id: placeId,
      }));

      await PlaceTags.bulkCreate(placeTags);
    }

    const allTags = await getAllTags();

    return {
      success: true,
      visitedPlaces: {
        tags: allTags,
      },
    };
  } catch (err) {
    console.log(err);
    const msg = err.message;

    if (msg == 'place') notFoundError('Place', placeId);
    if (msg == 'tag') throw ApiError.BadRequest('Tags is not iterable');
  }
};


const getProfileService = async () => {
  try {
    const allTags = await getAllTags()

    return {
      success: true,
      visitedPlaces: {
        tags: allTags
      }
    }
  } catch(err) {
    throw ApiError.UnauthorizedError()
  }
}

module.exports = {
  createProfileService,
  getProfileService
};
