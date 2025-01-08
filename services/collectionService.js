const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");
const { findUser } = require("./userServices");

const {
  Collections,
  Places,
  CollectionPlace,
  sequelize,
} = require("../models");

const returnedData = (collection) => {
  const data = {
    id: collection.id,
    name: collection.name,
    description: collection.description,
  };
  if (collection.places_ids) data.places_ids = collection.places_ids;

  return data;
};

const createCollectionService = async ({ userId, name, description, placesIds }) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await findUser(userId);
    if (!user) notFoundError("User", userId);

    // Генерируем уникальный ID
    const id = Date.now();

    const collection = await Collections.create(
      {
        id,
        name,
        description,
        user_id: user.id,
      },
      { transaction },
    );

    if (placesIds) {
      const collectionPlaces = [];

      if (Array.isArray(placesIds)) {
        for (const placeId of placesIds) {
          let place = await Places.findByPk(placeId);

          if (place) {
            collectionPlaces.push({
              collection_id: collection.id,
              place_id: place.id,
            });
          }
        }
      } else {
        let place = await Places.findByPk(placesIds);

        if (place) {
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

    await transaction.commit();
    return returnedData({ ...collection.dataValues, places_ids: placesIds });
  } catch (err) {
    console.log(err);
    throw ApiError.UnauthorizedError();
    await transaction.rollback();
  }
};

const getItemCollectionService = async ({ id }) => {
  try {
    const collection = await Collections.findByPk(id, {
      include: [{
        model: CollectionPlace,
        as: 'places',
        attributes: ['place_id']
      }]
    });
    if (!collection) throw new Error();

    const places_ids = collection.places.map(place => place.place_id);
    return returnedData({
      ...collection.dataValues,
      places_ids
    });
  } catch (err) {
    notFoundError("Collection", id);
  }
};
const getItemsCollectionService = async ({ limit, offset }) => {
  try {
    const collections = await Collections.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [{
        model: CollectionPlace,
        as: 'places',
        attributes: ['place_id']
      }]
    });

    return collections.map((collection) => {
      const places_ids = collection.places.map(place => place.place_id);
      return returnedData({
        ...collection.dataValues,
        places_ids
      });
    });
  } catch (err) {
    throw ApiError.UnauthorizedError();
  }
};

const updateCollectionService = async ({ id, ...data }) => {
  const transaction = await sequelize.transaction();
  try {
    const collection = await Collections.findByPk(id);
    if (!collection) throw new Error("collection");
    await collection.update(data, { transaction });
    if (data.places_ids) {
      const existingPlaces = await Places.findAll({
        where: { id: data.places_ids },
        attributes: ["id"],
      });

      const existingPlaceIdsInDB = existingPlaces.map((place) => place.id);

      const validPlaceIds = Array.isArray(data.places_ids)
        ? data.places_ids.filter((id) => existingPlaceIdsInDB.includes(id))
        : existingPlaceIdsInDB.includes(data.places_ids)
          ? [data.places_ids]
          : [];

      const existingLinks = await CollectionPlace.findAll({
        where: { collection_id: id },
        transaction,
      });

      const existingPlaceIds = existingLinks.map((link) => link.place_id);

      const toRemove = existingPlaceIds.filter(
        (placeId) => !validPlaceIds.includes(placeId),
      );
      const toAdd = validPlaceIds.filter(
        (placeId) => !existingPlaceIds.includes(placeId),
      );

      if (toRemove.length > 0) {
        await CollectionPlace.destroy({
          where: {
            collection_id: id,
            place_id: toRemove,
          },
          transaction,
        });
      }

      if (toAdd.length > 0) {
        const newLinks = toAdd.map((placeId) => ({
          collection_id: id,
          place_id: placeId,
        }));

        await CollectionPlace.bulkCreate(newLinks, { transaction });
      }
    }
    await transaction.commit();

    return returnedData({
      ...collection.dataValues,
      places_ids: data.places_ids,
    });
  } catch (err) {
    const msg = err.message;
    await transaction.rollback();
    if (msg == "collection") notFoundError("Collection", id);
  }
};

const removeCollectionService = async (id) => {
  try {
    const data = await Collections.destroy({
      where: {
        id,
      },
    });
    if (!data) throw Error;
  } catch (err) {
    notFoundError("Collection", id);
  }
};

module.exports = {
  createCollectionService,
  getItemCollectionService,
  getItemsCollectionService,
  updateCollectionService,
  removeCollectionService,
  notFoundError,
};
