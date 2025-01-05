const { PlaceProposals, Categories, User, Moderation } = require("../models");
const ApiError = require("../exceptions/apiError");
const { createPlaceService } = require("../services/placesService");

const findUser = async (userId) => {
  const user = await User.findOne({ where: { tg_id: userId } });

  return user;
};

const createProposalsService = async ({
  userId,
  categoryId,
  address,
  placeName,
}) => {
  try {
    const user = await findUser(userId);
    if (!user) throw new Error("user");

    if (categoryId) {
      const category = await Categories.findByPk(categoryId);
      if (!category) throw new Error("category");
    }

    const data = await PlaceProposals.create({
      user_id: user.id,
      category_id: categoryId,
      address: address,
      place_name: placeName,
      status: "Pending",
    });

    return {
      id: data.id,
      category_id: data.category_id,
      address: data.address,
      user_id: data.user_id,
      place_name: data.place_name,
      status: data.status,
    };
  } catch (err) {
    console.log(err);
    const msg = err.message;
    if (msg == "user") throw ApiError.NotFound("User not found");
    else if (msg == "category") throw ApiError.NotFound("Category not found");
    else throw ApiError.BadRequest("Something wrong");
  }
};
const getProposalsService = async ({ limit = 20, offset = 0, placeId }) => {
  try {
    if (placeId) {
      const place = await PlaceProposals.findByPk(placeId);
      if (!place) throw new Error();
      return {
        id: place.id,
        category_id: place.category_id,
        address: place.address,
        user_id: place.user_id,
        place_name: place.place_name,
        status: place.status,
      };
    } else {
      const places = await PlaceProposals.findAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return places.map((place) => ({
        id: place.id,
        category_id: place.category_id,
        address: place.address,
        user_id: place.user_id,
        place_name: place.place_name,
        status: place.status,
      }));
    }
  } catch (err) {
    throw ApiError.NotFound("Proposals place not found");
  }
};

const allowValues = ["Approved", "Rejected"];

const updateProposalsService = async ({ id, ...data }) => {
  try {
    const place = await PlaceProposals.findByPk(id);
    if (!place) throw new Error("place");

    if (data.categoryId) {
      const category = await Categories.findByPk(data.categoryId);
      if (!category) throw new Error("category");
    }

    if (data.status) {
      if (!allowValues.includes(data.status)) throw new Error("values");
      const user = await findUser(data.userId);

      if (!user) throw new Error("user");
      if (user.role !== "ADMIN") throw new Error("admin");
      let currentId = id;

      const isApproved = data.status == "Approved";

      if (isApproved) {
        // Create new item in PLACES table
        const placeData = await createPlaceService({
          name: place.place_name,
          address: place.address,
          categoryId: place.category_id,
        });
        if (!placeData) throw new Error("create");

        // Change id for Moderations
        currentId = placeData.id;
        const removedData = await PlaceProposals.destroy({ where: { id } });
        if (!removedData) throw new Error("create");
      }

      await Moderation.create({
        user_id: user.id,
        action: data.status,
        // Place or PlaceProposals
        target_type: isApproved ? "place" : "place_proposals",
        target_id: currentId,
      });

      if (isApproved) return {};
    }

    const response = await place.update(data);

    return {
      id: response.id,
      category_id: response.category_id,
      address: response.address,
      user_id: response.user_id,
      place_name: response.place_name,
      status: response.status,
    };
  } catch (err) {
    console.log(err);
    const msg = err.message;
    if (msg == "place") throw ApiError.NotFound("Place not found");
    else if (msg == "category") throw ApiError.NotFound("Category not found");
    else if (msg == "user") throw ApiError.NotFound("User not found");
    else if (msg == "admin")
      throw ApiError.BadRequest("Only admins can update the status");
    else if (msg == "values")
      throw ApiError.BadRequest(
        "The status can be either Approved or Rejected.",
      );
    else if (msg == "create") throw ApiError.UnauthorizedError();
    else throw ApiError.BadRequest("Something wrong");
  }
};
const removeProposalsService = async (id) => {
  try {
    const data = await PlaceProposals.destroy({ where: { id } });
    if (!data) throw new Error();
  } catch (err) {
    throw ApiError.NotFound("Proposals place not found");
  }
};

module.exports = {
  createProposalsService,
  getProposalsService,
  updateProposalsService,
  removeProposalsService,
};
