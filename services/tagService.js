const { Tags, Places, PlaceTags, sequelize } = require("../models");
const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");

const createTagsService = async ({ name, places_ids: placesIds }) => {
  const transaction = await sequelize.transaction();
  try {
    const data = await Tags.create({ name }, { transaction });

    if (placesIds) {
      const tagsPlaces = [];

      if (Array.isArray(placesIds)) {
        for (const placeId of placesIds) {
          let place = await Places.findByPk(placeId);
          if (place) {
            tagsPlaces.push({
              tag_id: data.id,
              place_id: place.id,
            });
          }
        }
      } else {
        let place = await Places.findByPk(placesIds);

        if (place) {
          tagsPlaces.push({
            tag_id: data.id,
            place_id: place.id,
          });
        }
      }

      if (tagsPlaces.length > 0) {
        await PlaceTags.bulkCreate(tagsPlaces, { transaction });
      }
    }

    await transaction.commit();

    return { id: data.id, name: data.name, placesIds };
  } catch (err) {
    throw ApiError.BadRequest("Error creating tag.");
  }
};

const updateTagsService = async ({ id, name, places_ids }) => {
  const transaction = await sequelize.transaction();
  try {
    const tag = await Tags.findByPk(id);

    if (!tag) {
      throw new Error();
    }

    const data = await tag.update({ name }, { transaction });

    if (places_ids) {
      const existingLinks = await PlaceTags.findAll({
        where: { tag_id: id },
        transaction,
      });

      const existingPlacesIds = existingLinks.map((link) => link.place_id);
      const idsToRemove = existingPlacesIds.filter(
        (placeId) => !places_ids.includes(placeId),
      );

      if (idsToRemove.length > 0) {
        await PlaceTags.destroy({
          where: {
            tag_id: id,
            place_id: idsToRemove,
          },
          transaction,
        });
      }

      const idsToAdd = places_ids.filter(
        (placeId) => !existingPlacesIds.includes(placeId),
      );

      const newLinks = idsToAdd.map((placeId) => ({
        tag_id: id,
        place_id: placeId,
      }));

      if (newLinks.length > 0) {
        await PlaceTags.bulkCreate(newLinks, { transaction });
      }
    }

    await transaction.commit();
    return { id: data.id, name: data.name, places_ids };
  } catch (err) {
    await transaction.rollback();
    notFoundError("Tag", id);
  }
};

const getTagsService = async ({ id, limit = 20, offset = 0 }) => {
  try {
    if (id) {
      const tag = await Tags.findByPk(id);
      if (!tag) throw new Error();
      return { id: tag.id, name: tag.name };
    } else {
      const tags = await Tags.findAll({
        limit,
        offset,
        attributes: ["id", "name"],
        order: [["createdAt", "DESC"]],
      });

      return tags.map((tag) => tag.get({ plain: true }));
    }
  } catch (err) {
    notFoundError("Tag", id);
  }
};

const removeTagsService = async (id) => {
  try {
    const data = await Tags.destroy({
      where: {
        id,
      },
    });

    if (!data) throw Error;
    return {};
  } catch (err) {
    console.log(err);
    notFoundError("Tag", id);
  }
};

module.exports = {
  createTagsService,
  updateTagsService,
  getTagsService,
  removeTagsService,
};
