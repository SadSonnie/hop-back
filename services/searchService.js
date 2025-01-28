const ApiError = require("../exceptions/apiError");
const { Places, Categories, PlaceTags, Tags, Collections, CollectionPlace, PlacePhotos } = require("../models");
const { Op } = require("sequelize");

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
    })) || [],
    coordinates: place.latitude && place.longitude ? {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude)
    } : null
  };
};

const getSearchService = async ({
  query,
  category,
  limit = 20,
  offset = 0,
}) => {
  try {
    const whereConditions = {};

    if (query) {
      whereConditions.name = {
        [Op.iLike]: `%${query}%`,
      };
    }

    if (category) {
      whereConditions.category_id = category;
    }

    const totalCount = await Places.count({
      where: whereConditions,
    });

    const items = await Places.findAll({
      where: whereConditions,
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
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      items: items.map(formatPlaceResponse),
      totalCount,
    };
  } catch (err) {
    console.error(err);
    throw ApiError.BadRequest("Search error occurred.");
  }
};

module.exports = {
  getSearchService,
};
