const ApiError = require("../exceptions/apiError");
const { Places, Categories, PlaceTags, Tags } = require("../models");
const { Op } = require("sequelize");

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
          attributes: ["id"],
        },
        {
          model: PlaceTags,
          include: [{
            model: Tags,
            as: "placesItems",
            attributes: ["id"],
          }],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      items: items.map((place) => ({
        id: `${place.id}`,
        name: place.name,
        address: place.address,
        category_id: `${place.category_id}`,
        description: place.description,
        isPremium: place.isPremium,
        priceLevel: place.priceLevel,
        latitude: place.latitude,
        longitude: place.longitude,
        phone: place.phone,
        tag_ids: place.PlaceTags ? place.PlaceTags.map(pt => pt.placesItems.id) : [],
      })),
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
