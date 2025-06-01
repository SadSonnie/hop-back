const ApiError = require("./exceptions/apiError");

const notFound = (item, id) => {
  return `${item} with id = ${id} not found`;
};
const badRequest = (item) => {
  return `The "${item}" field is required.`;
};

const notFoundError = (field, id) => {
  throw ApiError.NotFound(notFound(field, id));
};

const requiredField = (field) => {
  throw ApiError.BadRequest(badRequest(field));
};

module.exports = {
  notFound,
  badRequest,
  notFoundError,
  requiredField,
};
