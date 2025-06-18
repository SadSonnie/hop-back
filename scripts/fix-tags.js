const { sequelize, Tags, PlaceTags } = require('../models');

async function fixTags() {
  const t = await sequelize.transaction();

  try {
    // Удаляем связи с тегами, которые будут удалены
    await PlaceTags.destroy({
      where: {
        tag_id: [1, 2, 3, 4]
      },
      transaction: t
    });

    // Удаляем сами теги
    await Tags.destroy({
      where: {
        id: [1, 2, 3, 4]
      },
      transaction: t
    });

    // Переименовываем тег "Одному" в "Люди"
    await Tags.update(
      { name: 'Люди' },
      {
        where: { id: 6 },
        transaction: t
      }
    );

    await t.commit();
    console.log('Tags fixed successfully');
  } catch (error) {
    await t.rollback();
    console.error('Error fixing tags:', error);
  } finally {
    process.exit();
  }
}

fixTags(); 