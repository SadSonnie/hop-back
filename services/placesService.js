const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");
const {
  Categories,
  PlaceTags,
  Places,
  Collections,
  CollectionPlace,
  Tags,
  PlacePhotos,
  sequelize,
} = require("../models");

const getPhotoUrl = (filename) => {
  if (!filename) return null;
  return `${process.env.API_URL}/uploads/${filename}`;
};

const formatPlaceResponse = (place) => {
  const mainPhoto = place.PlacePhotos?.find(photo => photo.is_main);
  
  return {
    ...place.toJSON(),
    main_photo_url: mainPhoto ? getPhotoUrl(mainPhoto.photo_url) : null,
    photos: place.PlacePhotos?.map(photo => ({
      id: photo.id,
      url: getPhotoUrl(photo.photo_url),
      is_main: photo.is_main
    })) || []
  };
};

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
  collectionIds,
  tagsIds,
  address,
  categoryId,
  description,
  isPremium,
  priceLevel,
  coordinates,
  phone,
  photos = []
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
        category_id: categoryId,
        description,
        isPremium,
        priceLevel,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        phone,
      },
      { transaction }
    );

    if (collectionIds?.length) {
      await CollectionPlace.bulkCreate(
        collectionIds.map((id) => ({
          collection_id: id,
          place_id: place.id,
        })),
        { transaction }
      );
    }

    if (tagsIds?.length) {
      await PlaceTags.bulkCreate(
        tagsIds.map((id) => ({
          tag_id: id,
          place_id: place.id,
        })),
        { transaction }
      );
    }

    if (photos.length) {
      await PlacePhotos.bulkCreate(
        photos.map((photo, index) => ({
          place_id: place.id,
          photo_url: photo.filename,
          is_main: index === 0 // первое фото будет главным
        })),
        { transaction }
      );
    }

    await transaction.commit();

    return returnedValue({
      ...place.dataValues,
      collection_ids: collectionIds,
      tags_ids: tagsIds,
    });
  } catch (error) {
    await transaction.rollback();
    const msg = error.message;
    if (msg == "category") notFoundError("Category", categoryId);
    throw error;
  }
};

const getItemPlaceService = async ({ id }) => {
  const place = await Places.findOne({
    where: { id },
    include: [
      {
        model: Categories,
        attributes: ["id", "name"],
      },
      {
        model: PlaceTags,
        include: [
          {
            model: Tags,
            as: 'placesItems',
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: CollectionPlace,
        include: [
          {
            model: Collections,
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: PlacePhotos,
        attributes: ["id", "photo_url", "is_main"],
      }
    ],
  });

  if (!place) notFoundError("Place", id);

  return formatPlaceResponse(place);
};

const getItemsPlaceService = async ({ offset = 0, limit = 10 }) => {
  const places = await Places.findAll({
    offset: Number(offset),
    limit: Number(limit),
    include: [
      {
        model: Categories,
        attributes: ["id", "name"],
      },
      {
        model: PlaceTags,
        include: [
          {
            model: Tags,
            as: 'placesItems',
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: CollectionPlace,
        include: [
          {
            model: Collections,
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: PlacePhotos,
        attributes: ["id", "photo_url", "is_main"],
      }
    ],
  });

  return places.map(formatPlaceResponse);
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
      const existingCollections = await Collections.findAll({
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

    return formatPlaceResponse(place);
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
    return formatPlaceResponse(updatedPlace);
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
