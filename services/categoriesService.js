const ApiError = require("../exceptions/apiError");
const { Categories } = require("../models");

const createCategoriesService = async ({ name }) => {
  try {
    const category = await Categories.create({ name });
    return { id: category.id, name: category.name };
  } catch (err) {
    throw ApiError.BadRequest("somethig wrong");
  }
};

const getCategoriesService = async ({ id, limit = 20, offset = 0 }) => {
  try {
    if (id) {
      const category = await Categories.findByPk(id, {
        attributes: ["id", "name"],
      });

      if (!category) throw new Error();

      return {
        id: category.id,
        name: category.name,
      };
    } else {
      const categories = await Categories.findAll({
        limit,
        offset,
        attributes: ["id", "name"],
        order: [["createdAt", "DESC"]],
      });

      return categories.map((category) => ({
        id: category.id,
        name: category.name,
      }));
    }
  } catch (err) {
    throw ApiError.NotFound("Category not found");
  }
};

const updateCategoriesService = async ({ id, name }) => {
  try {
    const category = await Categories.findByPk(id);
    if (!category) throw new Error();

    const response = await category.update({ name });

    return { id: response.id, name: response.name };
  } catch (err) {
    throw ApiError.NotFound("Category not found");
  }
};

const removeCategoriesService = async (id) => {
  try {
    const category = await Categories.findByPk(id);
    if (!category) throw new Error();

    await category.destroy();
    return {};
  } catch (err) {
    throw ApiError.NotFound("Category not found");
  }
};

module.exports = {
  createCategoriesService,
  getCategoriesService,
  updateCategoriesService,
  removeCategoriesService,
};
