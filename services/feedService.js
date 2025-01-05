const ApiError = require("../exceptions/apiError");

const {
  Collections,
  Places,
  CollectionPlace,
  Sequelize,
  sequelize,
} = require("../models");

// const getItemsFeedService = async ({ limit = 20, offset = 0 }) => {
//   try {
//     const collections = await Collections.findAll({
//       limit,
//       offset,
//       include: [
//         {
//           model: CollectionPlace,
//           as: "places",
//           include: [
//             {
//               model: Places,
//               attributes: ["id", "name", "address"],
//               as: "placesItems",
//             },
//           ],
//           attributes: ["place_id"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//       attributes: {
//         include: [[Sequelize.literal(`'collection'`), "type"]],
//       },
//     });

//     const formattedCollections = collections.map((item) => {
//       const { name, id, type, places, createdAt } = item.dataValues;
//       return {
//         id,
//         type,
//         createdAt,
//         data: {
//           title: name,
//           places: places.map((place) => ({
//             id: place.place_id,
//             ...place.placesItems.dataValues,
//           })),
//         },
//       };
//     });

//     const places = await Places.findAll({
//       limit,
//       offset,
//       order: [["createdAt", "DESC"]],
//       attributes: {
//         include: [[Sequelize.literal(`'place'`), "type"]],
//       },
//     });

//     const formattedPlaces = places.map((place) => ({
//       id: place.id,
//       type: "place",
//       createdAt: place.createdAt,
//       data: {
//         name: place.name,
//         address: place.address,
//       },
//     }));

//     const combinedItems = [...formattedCollections, ...formattedPlaces]
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       .map((item) => {
//         const { createdAt, ...itemValue } = item;
//         return itemValue;
//       });

//     return {
//       items: combinedItems,
//       total: 0,
//     };
//   } catch (e) {
//     console.error(e);
//     throw ApiError.NotFound("An error occurred while retrieving items.");
//   }
// };

const getItemsFeedService = async ({ limit = 20, offset = 0 }) => {
  try {
    const query = `
      (
        SELECT
          c.id AS id,
          'collection' AS type,
          c."createdAt" AS "createdAt",
          c.name AS title,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'name', p.name,
              'address', p.address
            )
          ) AS places,
          NULL AS name,
          NULL AS address
        FROM "Collections" c
        LEFT JOIN "CollectionPlaces" cp ON c.id = cp.collection_id
        LEFT JOIN "Places" p ON cp.place_id = p.id
        GROUP BY c.id
      )
      UNION ALL
      (
        SELECT
          p.id AS id,
          'place' AS type,
          p."createdAt" AS "createdAt",
          NULL AS title,
          NULL AS places,
          p.name AS name,
          p.address AS address
        FROM "Places" p
      )
      ORDER BY "createdAt" DESC
      LIMIT :limit OFFSET :offset;
    `;

    const items = await sequelize.query(query, {
      replacements: { limit, offset },
      type: Sequelize.QueryTypes.SELECT,
    });

    const formattedItems = items.map((item) => ({
      id: item.id,
      type: item.type,
      data:
        item.type === "collection"
          ? { title: item.title, places: item.places }
          : { name: item.name, address: item.address },
    }));

    return {
      items: formattedItems,
      total: formattedItems.length,
    };
  } catch (e) {
    console.error(e);
    throw ApiError.NotFound("An error occurred while retrieving items.");
  }
};

module.exports = {
  getItemsFeedService,
};
