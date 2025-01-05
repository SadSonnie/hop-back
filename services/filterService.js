const { Filters } = require("../models");
const ApiError = require("../exceptions/apiError");
const { notFoundError } = require("../errorMessages");

const createFilterService = async (name) => {
  try {
    const filter = await Filters.create({ name });
    return { id: filter.id, name: filter.name };
  } catch (err) {
    throw ApiError.BadRequest("Error creating filter.");
  }
};

const updateFilterService = async ({ id, name }) => {
  try {
    const filter = await Filters.findByPk(id);
    if (!filter) throw new Error();

    const updatedFilter = await filter.update({ name });
    return { id: updatedFilter.id, name: updatedFilter.name };
  } catch (err) {
    notFoundError("Filter", id);
  }
};

const removeFilterService = async (id) => {
  try {
    const filter = await Filters.destroy({
      where: {
        id,
      },
    });

    if (!filter) throw new Error();

    return {};
  } catch (err) {
    notFoundError("Filter", id);
  }
};

const getFiltersService = async ({ id, limit = 20, offset = 0 }) => {
  try {
    if (id) {
      const filter = await Filters.findByPk(id);
      if (!filter) throw new Error();
      return { id: filter.id, name: filter.name };
    } else {
      const filters = await Filters.findAll({
        limit,
        offset,
        attributes: ["id", "name"],
        order: [["createdAt", "DESC"]],
      });
      return filters.map((filter) => filter.get({ plain: true }));
    }
  } catch (err) {
    notFoundError("Filter", id);
  }
};

module.exports = {
  createFilterService,
  updateFilterService,
  removeFilterService,
  getFiltersService,
};
