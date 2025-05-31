const models = require("../models");
const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");

const getPhotoUrl = (filename) => {
  if (!filename) return null;
  // Убираем лишний uploads из пути, если он есть
  const cleanFilename = filename.replace(/^uploads\//, '');
  return `${process.env.API_URL}/uploads/${cleanFilename}`;
};

const formatPlaceResponse = (place) => {
  const mainPhoto = place.PlacePhotos?.find(photo => photo.is_main);
  
  return {
    ...place.toJSON(),
    main_photo_url: mainPhoto ? getPhotoUrl(mainPhoto.photo_url) : null,
    avatar_url: place.avatar_url ? getPhotoUrl(place.avatar_url) : null,
    photos: place.PlacePhotos?.map(photo => ({
      id: photo.id,
      url: getPhotoUrl(photo.photo_url),
      is_main: photo.is_main
    })) || [],
    story_photos: place.PlaceStoryPhotos?.map(photo => ({
      id: photo.id,
      url: getPhotoUrl(photo.photo_url)
    })) || [],
    local_advice: place.LocalAdvice ? {
      id: place.LocalAdvice.id,
      title: place.LocalAdvice.title,
      content: place.LocalAdvice.content,
      author_name: place.LocalAdvice.author_name,
      author_nickname: place.LocalAdvice.author_nickname,
      occupation: place.LocalAdvice.occupation,
      link: place.LocalAdvice.link,
      photos: place.LocalAdvice.LocalAdvicePhotos?.map(photo => ({
        id: photo.id,
        url: getPhotoUrl(photo.photo_url)
      })) || []
    } : null,
    user_photos: place.PlaceUserPhotos?.map(photo => ({
      id: photo.id,
      photo_url: getPhotoUrl(photo.photo_url),
      author_name: photo.author_name,
      caption: photo.caption,
      link: photo.link,
      date: photo.date
    })) || [],
    hoop_video_url: place.hoop_video_url
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
    website: place.website,
    telegram: place.telegram,
    instagram: place.instagram,
    vk: place.vk,
    avatar_url: place.avatar_url ? getPhotoUrl(place.avatar_url) : null,
    hoop_video_url: place.hoop_video_url
  };
  if (place.collection_ids) data.collection_ids = place.collection_ids;
  if (place.tags_ids) data.tags_ids = place.tags_ids;
  if (place.story_photos) data.story_photos = place.story_photos;
  if (place.local_advice) data.local_advice = place.local_advice;
  if (place.user_photos) data.user_photos = place.user_photos;

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
  photos = [],
  storyPhotos = [],
  localAdvice = null,
  userPhotos = [],
  hoopVideo = null,
  isAdmin = false,
  status,
  website,
  telegram,
  instagram,
  vk
}) => {
  const transaction = await models.sequelize.transaction();

  try {
    const category = await models.Categories.findByPk(categoryId);
    if (!category) throw new Error("category");

    const id = Date.now();

    const place = await models.Places.create(
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
        status: status || 'pending',
        website,
        telegram,
        instagram,
        vk,
        hoop_video_url: hoopVideo?.filename
      },
      { transaction }
    );

    if (collectionIds?.length) {
      await models.CollectionPlace.bulkCreate(
        collectionIds.map((id) => ({
          collection_id: id,
          place_id: place.id,
        })),
        { transaction }
      );
    }

    if (tagsIds?.length) {
      await models.PlaceTags.bulkCreate(
        tagsIds.map((id) => ({
          tag_id: id,
          place_id: place.id,
        })),
        { transaction }
      );
    }

    if (photos.length) {
      await models.PlacePhotos.bulkCreate(
        photos.map((photo, index) => ({
          place_id: place.id,
          photo_url: photo.filename,
          is_main: index === 0
        })),
        { transaction }
      );
    }

    if (storyPhotos.length) {
      await models.PlaceStoryPhotos.bulkCreate(
        storyPhotos.map(photo => ({
          place_id: place.id,
          photo_url: photo.filename
        })),
        { transaction }
      );
    }

    if (localAdvice) {
      await models.LocalAdvice.create({
        place_id: place.id,
        title: localAdvice.title,
        content: localAdvice.content,
        author_name: localAdvice.author_name,
        author_nickname: localAdvice.author_nickname,
        occupation: localAdvice.occupation,
        link: localAdvice.link
      }, { transaction });
    }

    if (userPhotos.length) {
      await models.PlaceUserPhotos.bulkCreate(
        userPhotos.map(photo => ({
          id: Date.now() + Math.floor(Math.random() * 1000),
          place_id: place.id,
          photo_url: photo.photo.filename,
          author_name: photo.author_name,
          caption: photo.caption,
          link: photo.link,
          date: photo.date || new Date()
        })),
        { transaction }
      );
    }

    await transaction.commit();

    return returnedValue({
      ...place.dataValues,
      collection_ids: collectionIds,
      tags_ids: tagsIds,
      story_photos: storyPhotos,
      local_advice: localAdvice,
      user_photos: userPhotos
    });
  } catch (error) {
    await transaction.rollback();
    const msg = error.message;
    if (msg == "category") notFoundError("Category", categoryId);
    throw error;
  }
};

const getItemPlaceService = async (id) => {
  try {
    // If id is an object with an id property, use that
    const placeId = typeof id === 'object' ? id.id : id;

    const place = await models.Places.findByPk(placeId, {
      include: [
        {
          model: models.Categories,
          attributes: ["id", "name"],
        },
        {
          model: models.PlaceTags,
          include: [
            {
              model: models.Tags,
              as: 'placesItems',
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: models.CollectionPlace,
          include: [
            {
              model: models.Collections,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: models.PlacePhotos,
          attributes: ["id", "photo_url", "is_main"],
        },
        {
          model: models.PlaceStoryPhotos,
          attributes: ["id", "photo_url"],
        },
        {
          model: models.LocalAdvice,
          attributes: ["id", "title", "content", "author_name", "author_nickname", "occupation", "link"],
          include: [
            {
              association: 'LocalAdvicePhotos',
              attributes: ["id", "photo_url"]
            },
          ],
        },
        {
          model: models.PlaceUserPhotos,
          attributes: ["id", "photo_url", "author_name", "caption", "link", "date"],
        },
      ],
    });

    if (!place) throw new Error("place");

    return formatPlaceResponse(place);
  } catch (error) {
    const msg = error.message;
    if (msg == "place") notFoundError("Place", placeId);
    throw error;
  }
};

const getItemsPlaceService = async ({ offset = 0, limit = 1000, showAll = false }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const where = showAll === true ? {} : { status: 'approved' };
      
      const places = await models.Places.findAll({
        where,
        offset: Number(offset),
        limit: Number(limit),
        include: [
          {
            model: models.Categories,
            attributes: ["id", "name"],
          },
          {
            model: models.PlaceTags,
            include: [
              {
                model: models.Tags,
                as: 'placesItems',
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: models.CollectionPlace,
            include: [
              {
                model: models.Collections,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: models.PlacePhotos,
            attributes: ["id", "photo_url", "is_main"],
          }
        ],
      });

      resolve(places.map(formatPlaceResponse));
    } catch (err) {
      reject(err);
    }
  });
};

const updatePlaceService = async ({ id, body, ...data }) => {
  const transaction = await models.sequelize.transaction();
  try {
    const place = await models.Places.findByPk(id);
    if (!place) throw new Error("place");

    if (data.categoryId) {
      const category = await models.Categories.findByPk(data.categoryId);
      if (!category) throw new Error("category");
    }

    // Обновляем основные данные места
    const updateData = {
      name: data.name,
      address: data.address,
      category_id: data.categoryId,
      description: data.description,
      isPremium: data.isPremium,
      priceLevel: data.priceLevel,
      latitude: data.coordinates?.latitude,
      longitude: data.coordinates?.longitude,
      phone: data.phone,
      status: data.status,
      website: data.website,
      telegram: data.telegram,
      instagram: data.instagram,
      vk: data.vk,
    };

    // Логи для отладки аватарки
    console.log('Avatar deletion debug:');
    console.log('data.avatar_url:', data.avatar_url);
    console.log('data.files?.avatar:', data.files?.avatar);
    
    // Обрабатываем avatar_url
    if (data.files?.avatar?.[0]) {
      // Если загружен новый файл аватарки
      updateData.avatar_url = data.files.avatar[0].filename;
    } else if (data.avatar_url === "null" || data.avatar_url === null) {
      // Если пришел явный null или строка "null" - удаляем аватарку
      updateData.avatar_url = null;
    } else if (data.avatar_url) {
      // Если пришло значение аватарки - используем его
      updateData.avatar_url = data.avatar_url;
    }
    
    console.log('Final avatar_url value:', updateData.avatar_url);
    console.log('Full update data:', updateData);

    // Обновляем видео
    if (data.files?.hoop_video?.[0]) {
      // Если загружен новый файл видео
      updateData.hoop_video_url = data.files.hoop_video[0].filename;
    } else if (data.hoop_video_url === "null" || data.hoop_video_url === null || body?.hoop_video_url === "null") {
      // Если пришло "null" в любом виде - удаляем видео
      updateData.hoop_video_url = null;
    }

    // Логи для отладки видео
    console.log('Video deletion debug:');
    console.log('data.hoop_video_url:', data.hoop_video_url);
    console.log('body.hoop_video_url:', body?.hoop_video_url);
    console.log('Final hoop_video_url value:', updateData.hoop_video_url);

    await place.update(updateData, { transaction });

    // Обновляем теги места
    if (data.tagsIds && Array.isArray(data.tagsIds)) {
      // Удаляем старые связи с тегами
      await models.PlaceTags.destroy({
        where: { place_id: id },
        transaction
      });

      // Создаем новые связи с тегами
      if (data.tagsIds.length > 0) {
        const tagRecords = data.tagsIds.map(tagId => ({
          place_id: id,
          tag_id: tagId
        }));
        await models.PlaceTags.bulkCreate(tagRecords, { transaction });
      }
    }

    // Обработка пользовательских фотографий
    if (data.userPhotos && data.userPhotos.length > 0) {
      // Удаляем старые фотографии
      await models.PlaceUserPhotos.destroy({
        where: { place_id: id },
        transaction
      });

      // Создаем новые записи для фотографий
      const userPhotoRecords = data.userPhotos.map(photo => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        place_id: id,
        photo_url: photo.photo.filename,
        author_name: photo.author_name,
        caption: photo.caption,
        link: photo.link,
        date: photo.date
      }));

      await models.PlaceUserPhotos.bulkCreate(userPhotoRecords, { transaction });
    } else {
      // Если в запросе нет фотографий - удаляем все существующие
      await models.PlaceUserPhotos.destroy({
        where: { place_id: id },
        transaction
      });
    }

    // Обновляем обычные фотографии
    if (data.files?.photos?.length > 0) {
      // Парсим метаданные фотографий, если они есть
      const photosMetadata = body?.photos_metadata ? JSON.parse(body.photos_metadata) : [];
      console.log('Photos metadata:', photosMetadata);

      // Если есть новые фотографии - добавляем их к существующим
      const photoRecords = data.files.photos.map((photo, index) => {
        // Ищем метаданные для текущей фотографии
        const metadata = photosMetadata.find(m => m.file_index === index);
        return {
          place_id: id,
          photo_url: photo.filename,
          is_main: metadata?.is_main || false
        };
      });

      // Если какая-то из новых фотографий помечена как главная,
      // снимаем флаг главного фото с существующих фотографий
      if (photoRecords.some(record => record.is_main)) {
        await models.PlacePhotos.update(
          { is_main: false },
          {
            where: { place_id: id },
            transaction
          }
        );
      }

      await models.PlacePhotos.bulkCreate(photoRecords, { transaction });

      // Логи для отладки главного фото
      console.log('Photos update debug:');
      console.log('New photos:', photoRecords);
    }

    // Обрабатываем удаление фотографий
    if (body?.deleted_photos) {
      const deletedPhotos = JSON.parse(body.deleted_photos);
      if (deletedPhotos.length > 0) {
        // Извлекаем имена файлов из полных URL
        const deletedPhotoNames = deletedPhotos.map(url => {
          const parts = url.split('/');
          return parts[parts.length - 1];
        });
        
        console.log('Deleting specific photos:', deletedPhotoNames);
        
        // Удаляем указанные фотографии
        await models.PlacePhotos.destroy({
          where: {
            place_id: id,
            photo_url: deletedPhotoNames
          },
          transaction
        });

        // Проверяем, не удалили ли мы главное фото
        const hasMainPhoto = await models.PlacePhotos.count({
          where: {
            place_id: id,
            is_main: true
          },
          transaction
        }) > 0;

        // Если нет главного фото и есть другие фотографии, делаем первое из них главным
        if (!hasMainPhoto) {
          const firstPhoto = await models.PlacePhotos.findOne({
            where: { place_id: id },
            order: [['createdAt', 'ASC']],
            transaction
          });

          if (firstPhoto) {
            await firstPhoto.update({ is_main: true }, { transaction });
          }
        }
      }
    }

    // Логи для отладки фотографий
    console.log('Photos update debug:');
    console.log('data.files?.photos:', data.files?.photos);
    console.log('body?.deleted_photos:', body?.deleted_photos);
    console.log('deleted_photos parsed:', body?.deleted_photos ? JSON.parse(body.deleted_photos) : null);

    // Обновляем фотографии историй
    if (!data.files?.story_photos || data.files.story_photos.length === 0) {
      // Если фотографий историй нет в запросе - удаляем все существующие
      await models.PlaceStoryPhotos.destroy({
        where: { place_id: id },
        transaction
      });
    } else if (data.files.story_photos.length > 0) {
      // Если есть новые фотографии историй - удаляем старые и добавляем новые
      await models.PlaceStoryPhotos.destroy({
        where: { place_id: id },
        transaction
      });

      const storyPhotoRecords = data.files.story_photos.map(photo => ({
        place_id: id,
        photo_url: photo.filename
      }));

      await models.PlaceStoryPhotos.bulkCreate(storyPhotoRecords, { transaction });
    }

    // Обновляем локальный совет
    if (data.localAdvice) {
      console.log('=== DEBUG LOCAL ADVICE UPDATE START ===');
      console.log('Raw data:', {
        ...data,
        body,
        local_advice_photo_url: body?.local_advice_photo_url
      });
      
      // Ищем существующий совет
      let existingAdvice = await models.LocalAdvice.findOne({
        where: { place_id: id },
        transaction,
        include: [{
          model: models.LocalAdvicePhotos,
          as: 'LocalAdvicePhotos'
        }]
      });

      console.log('Existing advice:', existingAdvice ? {
        id: existingAdvice.id,
        photos: existingAdvice.LocalAdvicePhotos?.map(p => ({id: p.id, url: p.photo_url}))
      } : null);

      if (existingAdvice) {
        // Если есть фотографии и local_advice_photo_url === "null", удаляем их
        if (existingAdvice.LocalAdvicePhotos?.length > 0 && body?.local_advice_photo_url === "null") {
          console.log('Attempting to delete local advice photos for advice:', existingAdvice.id);
          const result = await models.LocalAdvicePhotos.destroy({
            where: { local_advice_id: existingAdvice.id },
            transaction
          });
          console.log('Local advice photos deletion result:', result);
        }

        // Обновляем данные совета
        await existingAdvice.update({
          title: data.localAdvice.title,
          content: data.localAdvice.content,
          author_name: data.localAdvice.author_name,
          author_nickname: data.localAdvice.author_nickname,
          occupation: data.localAdvice.occupation,
          link: data.localAdvice.link
        }, { transaction });

        // Если есть новые фотографии и не было запроса на удаление, добавляем их
        if (data.files?.local_advice_photo && String(data.local_advice_photo_url) !== "null") {
          // Сначала удаляем старые фотографии
          await models.LocalAdvicePhotos.destroy({
            where: { local_advice_id: existingAdvice.id },
            transaction
          });

          // Затем добавляем новые
          const photoRecords = data.files.local_advice_photo.map(photo => ({
            local_advice_id: existingAdvice.id,
            photo_url: photo.filename
          }));

          await models.LocalAdvicePhotos.bulkCreate(photoRecords, { transaction });
        }

        // Проверяем результат после всех операций
        const updatedAdvice = await models.LocalAdvice.findOne({
          where: { place_id: id },
          transaction,
          include: [{
            model: models.LocalAdvicePhotos,
            as: 'LocalAdvicePhotos'
          }]
        });

        console.log('Updated advice:', updatedAdvice ? {
          id: updatedAdvice.id,
          photos: updatedAdvice.LocalAdvicePhotos?.map(p => p.id)
        } : null);
      } else {
        // Если совета нет, создаем новый
        const createdAdvice = await models.LocalAdvice.create({
          place_id: id,
          title: data.localAdvice.title,
          content: data.localAdvice.content,
          author_name: data.localAdvice.author_name,
          author_nickname: data.localAdvice.author_nickname,
          occupation: data.localAdvice.occupation,
          link: data.localAdvice.link
        }, { transaction });

        // Добавляем фотографии только если не было запроса на удаление
        if (data.files?.local_advice_photo && String(data.local_advice_photo_url) !== "null") {
          const photoRecords = data.files.local_advice_photo.map(photo => ({
            local_advice_id: createdAdvice.id,
            photo_url: photo.filename
          }));

          await models.LocalAdvicePhotos.bulkCreate(photoRecords, { transaction });
        }
      }
      console.log('=== DEBUG LOCAL ADVICE UPDATE END ===');
    }

    // Обновляем связи с коллекциями
    if (data.collectionIds) {
      const existingCollections = await models.Collections.findAll({
        where: { id: data.collectionIds },
        attributes: ["id"],
      });

      const existingCollectionIds = existingCollections.map(
        (collection) => collection.id,
      );

      const validCollectionIds = Array.isArray(data.collectionIds)
        ? data.collectionIds.filter((id) => existingCollectionIds.includes(id))
        : existingCollectionIds.includes(data.collectionIds)
          ? [data.collectionIds]
          : [];

      const existingLinks = await models.CollectionPlace.findAll({
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
        await models.CollectionPlace.destroy({
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

        await models.CollectionPlace.bulkCreate(newLinks, { transaction });
      }
    }

    await transaction.commit();

    // Получаем обновленное место со всеми связанными данными
    const updatedPlace = await models.Places.findByPk(id, {
      include: [
        {
          model: models.PlacePhotos,
          attributes: ["id", "photo_url", "is_main"],
        },
        {
          model: models.PlaceStoryPhotos,
          attributes: ["id", "photo_url"],
        },
        {
          model: models.LocalAdvice,
          attributes: ["id", "title", "content", "author_name", "author_nickname", "occupation", "link"],
        },
        {
          model: models.PlaceUserPhotos,
          attributes: ["id", "photo_url", "author_name", "caption", "link", "date"],
        },
        {
          model: models.PlaceTags,
          include: [
            {
              model: models.Tags,
              as: 'placesItems',
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    return formatPlaceResponse(updatedPlace);
  } catch (err) {
    const msg = err.message;
    if (msg == "place") notFoundError("Place", id);
    if (msg == "category") notFoundError("Category", id);
    await transaction.rollback();
    throw err;
  }
};

const removePlaceService = async (id) => {
  const transaction = await models.sequelize.transaction();
  
  try {
    // Проверяем существование места по ID
    const place = await models.Places.findByPk(id);
    if (!place) {
      await transaction.rollback();
      notFoundError("Place", id);
    }

    // Удаляем связанные данные
    await Promise.all([
      // Удаляем связанные записи просмотров
      models.PlaceViews.destroy({
        where: { place_id: id },
        transaction
      }),
      // Удаляем связанные фотографии
      models.PlacePhotos.destroy({
        where: { place_id: id },
        transaction
      }),
      // Удаляем связанные фотографии историй
      models.PlaceStoryPhotos.destroy({
        where: { place_id: id },
        transaction
      }),
      // Удаляем связанные пользовательские фотографии
      models.PlaceUserPhotos.destroy({
        where: { place_id: id },
        transaction
      }),
      // Удаляем связанные локальные советы
      models.LocalAdvice.destroy({
        where: { place_id: id },
        transaction
      }),
      // Удаляем связи с коллекциями
      models.CollectionPlace.destroy({
        where: { place_id: id },
        transaction
      }),
      // Удаляем связи с тегами
      models.PlaceTags.destroy({
        where: { place_id: id },
        transaction
      })
    ]);
    
    // Удаляем само место
    await models.Places.destroy({
      where: { id },
      transaction
    });
    
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const addPicturePlace = async ({ id, files }) => {
  const transaction = await models.sequelize.transaction();
  
  try {
    const place = await models.Places.findByPk(id);
    if (!place) throw new Error("place");

    // Удаляем все старые фото для этого места
    await models.PlacePhotos.destroy({
      where: { place_id: id },
      transaction
    });

    // Создаем новые записи для фотографий
    const photoRecords = files.map((filePath, index) => ({
      place_id: id,
      photo_url: filePath,
      is_main: index === 0 // Первое фото становится основным
    }));

    await models.PlacePhotos.bulkCreate(photoRecords, { transaction });
    
    await transaction.commit();

    // Получаем обновленное место со всеми фото
    const updatedPlace = await models.Places.findByPk(id, {
      include: [{
        model: models.PlacePhotos,
        attributes: ['id', 'photo_url', 'is_main']
      }]
    });

    return formatPlaceResponse(updatedPlace);
  } catch (e) {
    await transaction.rollback();
    if (e.message === "place") notFoundError("Place", id);
    throw e;
  }
};

const setPlaceAvatar = async ({ id, file }) => {
  const transaction = await models.sequelize.transaction();
  
  try {
    const place = await models.Places.findByPk(id);
    if (!place) throw new Error("place");

    // Обновляем аватарку места
    await place.update({ 
      avatar_url: file.filename 
    }, { transaction });
    
    await transaction.commit();

    // Получаем обновленное место
    const updatedPlace = await models.Places.findByPk(id, {
      include: [{
        model: models.PlacePhotos,
        attributes: ['id', 'photo_url', 'is_main']
      }]
    });

    return {
      ...formatPlaceResponse(updatedPlace),
      avatar_url: getPhotoUrl(updatedPlace.avatar_url)
    };
  } catch (e) {
    await transaction.rollback();
    if (e.message === "place") notFoundError("Place", id);
    throw e;
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
  setPlaceAvatar
};
