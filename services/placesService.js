const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");
const {
  Categories,
  PlaceTags,
  Places,
  Collections,
  CollectionPlace,
  Tags,
  sequelize,
} = require("../models");

const returnedValue = (place) => {
  const data = {
    name: place.name,
    address: place.address,
    category_id: place.category_id,
    id: place.id,
    description: place.description,
    isPremium: place.isPremium,
    priceLevel: place.priceLevel,
    coordinates: place.latitude && place.longitude ? {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude)
    } : null,
    phone: place.phone,
    image: place.image,
  };
  if (place.collection_ids) data.collection_ids = place.collection_ids;
  if (place.tags_ids) data.tags_ids = place.tags_ids;

  return data;
};

const createPlaceService = async ({
  name,
  address,
  categoryId,
  collectionIds,
  tagsIds,
  description,
  isPremium,
  priceLevel,
  coordinates,
  phone
}) => {
  const transaction = await sequelize.transaction();
  try {
    const category = await Categories.findByPk(categoryId);
    if (!category) throw new Error("category");

    // Генерируем уникальный ID
    const id = Date.now();

    const place = await Places.create(
      { 
        id, 
        name, 
        address, 
        category_id: category.id,
        description,
        isPremium,
        priceLevel,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        phone
      },
      { transaction },
    );

    if (collectionIds) {
      const collectionPlaces = [];
      if (Array.isArray(collectionIds)) {
        for (const collectionId of collectionIds) {
          let collection = await Collections.findByPk(collectionId);

          if (collection) {
            collectionPlaces.push({
              collection_id: collection.id,
              place_id: place.id,
            });
          }
        }
      } else {
        let collection = await Collections.findByPk(collectionIds);

        if (collection) {
          collectionPlaces.push({
            collection_id: collection.id,
            place_id: place.id,
          });
        }
      }
      if (collectionPlaces.length > 0) {
        await CollectionPlace.bulkCreate(collectionPlaces, { transaction });
      }
    }

    if (tagsIds) {
      const placeTags = [];
      if (Array.isArray(tagsIds)) {
        for (const tagId of tagsIds) {
          const tag = await Tags.findByPk(tagId);
          if (tag) {
            placeTags.push({
              tag_id: tag.id,
              place_id: place.id,
            });
          }
        }
      } else {
        const tag = await Tags.findByPk(tagsIds);
        if (tag) {
          placeTags.push({
            tag_id: tag.id,
            place_id: place.id,
          });
        }
      }
      if (placeTags.length > 0) {
        await PlaceTags.bulkCreate(placeTags, { transaction });
      }
    }

    await transaction.commit();

    return returnedValue({
      ...place.dataValues,
      collection_ids: collectionIds,
      tags_ids: tagsIds,
    });
  } catch (err) {
    const msg = err.message;
    if (msg == "category") notFoundError("Category", categoryId);
    await transaction.rollback();
  }
};

const getItemPlaceService = async ({ id }) => {
  try {
    const place = await Places.findByPk(id, {
      include: [
        {
          model: PlaceTags,
          include: [{
            model: Tags,
            as: 'placesItems'
          }]
        }
      ]
    });
    if (!place) throw new Error();

    const tags_ids = place.PlaceTags?.map(pt => pt.tag_id) || [];
    return returnedValue({
      ...place.dataValues,
      tags_ids
    });
  } catch (err) {
    notFoundError("Place", id);
  }
};

const getItemsPlaceService = async ({ limit, offset }) => {
  try {
    const places = await Places.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: PlaceTags,
          include: [{
            model: Tags,
            as: 'placesItems'
          }]
        }
      ]
    });

    return places.map((place) => {
      const tags_ids = place.PlaceTags?.map(pt => pt.tag_id) || [];
      return returnedValue({
        ...place.dataValues,
        tags_ids
      });
    });
  } catch (err) {
    notFoundError("Place", id);
  }
};

const updatePlaceService = async ({ id, ...data }) => {
  const transaction = await sequelize.transaction();
  try {
    const place = await Places.findByPk(id);
    if (!place) throw new Error("place");

    if (data.category_id) {
      const category = await Categories.findByPk(data.category_id);
      if (!category) throw new Error("category");
    }

    await place.update(data, { transaction });

    if (data.collection_ids) {
      const existingCollections = await Collection.findAll({
        where: { id: data.collection_ids },
        attributes: ["id"],
      });

      const existingCollectionIds = existingCollections.map(
        (collection) => collection.id,
      );

      const validCollectionIds = Array.isArray(data.collection_ids)
        ? data.collection_ids.filter((id) => existingCollectionIds.includes(id))
        : existingCollectionIds.includes(data.collection_ids)
          ? [data.collection_ids]
          : [];

      const existingLinks = await CollectionPlace.findAll({
        where: { place_id: id },
        transaction,
      });

      const existingLinkIds = existingLinks.map((link) => link.collection_id);

      const toRemove = existingLinkIds.filter(
        (collectionId) => !validCollectionIds.includes(collectionId),
      );
      const toAdd = validCollectionIds.filter(
        (collectionId) => !existingLinkIds.includes(collectionId),
      );

      if (toRemove.length > 0) {
        await CollectionPlace.destroy({
          where: {
            place_id: id,
            collection_id: toRemove,
          },
          transaction,
        });
      }

      if (toAdd.length > 0) {
        const newLinks = toAdd.map((collectionId) => ({
          place_id: id,
          collection_id: collectionId,
        }));

        await CollectionPlace.bulkCreate(newLinks, { transaction });
      }
    }

    if (data.tags_ids) {
      const existingTags = await Tags.findAll({
        where: { id: data.tags_ids },
        attributes: ["id"],
      });

      const existingTagIds = existingTags.map((tag) => tag.id);

      const validTagIds = Array.isArray(data.tags_ids)
        ? data.tags_ids.filter((id) => existingTagIds.includes(id))
        : existingTagIds.includes(data.tags_ids)
          ? [data.tags_ids]
          : [];

      const existingTagLinks = await PlaceTags.findAll({
        where: { place_id: id },
        transaction,
      });

      const existingTagLinkIds = existingTagLinks.map((link) => link.tag_id);

      const toRemoveTags = existingTagLinkIds.filter(
        (tagId) => !validTagIds.includes(tagId),
      );
      const toAddTags = validTagIds.filter(
        (tagId) => !existingTagLinkIds.includes(tagId),
      );

      if (toRemoveTags.length > 0) {
        await PlaceTags.destroy({
          where: {
            place_id: id,
            tag_id: toRemoveTags,
          },
          transaction,
        });
      }

      if (toAddTags.length > 0) {
        const newTagLinks = toAddTags.map((tagId) => ({
          place_id: id,
          tag_id: tagId,
        }));

        await PlaceTags.bulkCreate(newTagLinks, { transaction });
      }
    }

    await transaction.commit();

    return returnedValue({
      ...place.dataValues,
      collection_ids: data.collection_ids,
      tags_ids: data.tags_ids,
    });
  } catch (err) {
    const msg = err.message;
    if (msg == "place") notFoundError("Place", id);
    if (msg == "category") notFoundError("Category", id);
    await transaction.rollback();
  }
};

const removePlaceService = async (id) => {
  try {
    const data = await Places.destroy({
      where: {
        id,
      },
    });
    if (!data) throw Error;
  } catch (err) {
    notFoundError("Place", id);
  }
};

const addPicturePlace = async ({ id, name }) => {
  try {
    const place = await Places.findByPk(id);
    if (!place) throw new Error();

    const updatedPlace = await place.update({
      image: `${process.env.HOST}${name}`,
    });
    return returnedValue(updatedPlace);
  } catch (e) {
    notFoundError("Place", id);
  }
};

module.exports = {
  createPlaceService,
  getItemPlaceService,
  getItemsPlaceService,
  updatePlaceService,
  removePlaceService,
  notFoundError,
  addPicturePlace,
};
