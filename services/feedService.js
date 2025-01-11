const ApiError = require("../exceptions/apiError");
const {
  Collections,
  Places,
  CollectionPlace,
  FeedOrder,
  Sequelize,
  sequelize,
} = require("../models");

// Функция для генерации уникального ID
const generateUniqueId = async (model, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const id = Date.now() + attempt; // Добавляем attempt чтобы избежать коллизий в одну миллисекунду
    
    // Проверяем, существует ли уже такой ID
    const existing = await model.findOne({ where: { id } });
    
    if (!existing) {
      return id;
    }
  }
  
  throw new Error('Failed to generate unique ID after ' + maxAttempts + ' attempts');
};

const getItemsFeedService = async ({ limit = 20, offset = 0 }) => {
  try {
    const query = `
      WITH ordered_items AS (
        SELECT "itemId", "itemType", "order"
        FROM "FeedOrders"
        ORDER BY "order" ASC
      ),
      feed_items AS (
        (
          SELECT
            c.id AS id,
            'collection' AS type,
            c."createdAt" AS "createdAt",
            c.name AS title,
            c.description AS description,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', p.id,
                'name', p.name,
                'address', p.address
              )
            ) AS places,
            NULL AS name,
            NULL AS address,
            o."order" as item_order
          FROM "Collections" c
          INNER JOIN ordered_items o ON o."itemId" = c.id AND o."itemType" = 'collection'
          LEFT JOIN "CollectionPlaces" cp ON c.id = cp.collection_id
          LEFT JOIN "Places" p ON cp.place_id = p.id
          GROUP BY c.id, o."order"
        )
        UNION ALL
        (
          SELECT
            p.id AS id,
            'place' AS type,
            p."createdAt" AS "createdAt",
            NULL AS title,
            NULL AS description,
            NULL AS places,
            p.name AS name,
            p.address AS address,
            o."order" as item_order
          FROM "Places" p
          INNER JOIN ordered_items o ON o."itemId" = p.id AND o."itemType" = 'place'
        )
      )
      SELECT * FROM feed_items
      ORDER BY item_order ASC
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
          ? { title: item.title, description: item.description, places: item.places }
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

const createItemsFeedService = async ({ items }) => {
  const transaction = await sequelize.transaction();
  try {
    const createdItems = [];

    for (const item of items) {
      if (item.type === "place") {
        // Сначала пытаемся найти существующее место
        let place = await Places.findByPk(item.id, { transaction });
        
        // Если место не найдено - создаем новое
        if (!place) {
          place = await Places.create({
            id: item.id,
            name: item.data.name,
            address: item.data.address,
          }, { transaction });
        }

        createdItems.push({
          id: place.id,
          type: "place",
          data: {
            name: place.name,
            address: place.address,
          },
        });
      } else if (item.type === "collection") {
        // Сначала пытаемся найти существующую коллекцию
        let collection = await Collections.findByPk(item.id, { transaction });
        
        // Если коллекция не найдена - создаем новую
        if (!collection) {
          // Генерируем уникальный ID
          const id = await generateUniqueId(Collections);
          
          collection = await Collections.create({
            id,
            name: item.data.title,
            description: item.data.description,
          }, { transaction });
        }

        if (item.data.places && Array.isArray(item.data.places)) {
          for (const place of item.data.places) {
            let placeRecord = await Places.findOne({
              where: { id: place.id },
            }, { transaction });

            if (!placeRecord) {
              placeRecord = await Places.create({
                id: place.id,
                name: place.name,
                address: place.address,
              }, { transaction });
            }

            // Проверяем существование связи
            const existingLink = await CollectionPlace.findOne({
              where: {
                collection_id: collection.id,
                place_id: placeRecord.id
              }
            }, { transaction });

            if (!existingLink) {
              await CollectionPlace.create({
                collection_id: collection.id,
                place_id: placeRecord.id,
              }, { transaction });
            }
          }
        }

        createdItems.push({
          id: collection.id,
          type: "collection",
          data: {
            title: collection.name,
            description: collection.description,
            places: item.data.places,
          },
        });
      }
    }

    // Сохраняем порядок элементов
    await FeedOrder.destroy({
      truncate: true,
      transaction
    });

    await Promise.all(createdItems.map(async (item, index) => {
      await FeedOrder.create({
        itemId: item.id,
        itemType: item.type,
        order: index
      }, { transaction });
    }));

    await transaction.commit();
    return {
      items: createdItems,
      total: createdItems.length,
    };
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
};

const updateItemFeedService = async ({ items }) => {
  const transaction = await sequelize.transaction();
  try {
    // Очищаем текущий порядок
    await FeedOrder.destroy({
      truncate: true,
      transaction
    });

    // Проверяем существование всех элементов перед обновлением
    for (const item of items) {
      if (item.type === 'collection') {
        const collection = await Collections.findByPk(item.id, { transaction });
        if (!collection) {
          throw ApiError.NotFound(`Collection with id ${item.id} not found`);
        }
      } else if (item.type === 'place') {
        const place = await Places.findByPk(item.id, { transaction });
        if (!place) {
          throw ApiError.NotFound(`Place with id ${item.id} not found`);
        }
      }
    }

    // Обновляем порядок элементов
    await Promise.all(items.map(async (item, index) => {
      await FeedOrder.create({
        itemId: item.id,
        itemType: item.type,
        order: index
      }, { transaction });
    }));

    await transaction.commit();
    return { items, total: items.length };
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
};

module.exports = {
  getItemsFeedService,
  createItemsFeedService,
  updateItemFeedService
};
