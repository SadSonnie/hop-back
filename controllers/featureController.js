'use strict';

const { requiredField } = require('../errorMessages');
const { requestLog } = require('../logger');
const {
  createFeatureService,
  removeFeatureService,
  addFeatureToPlaceService,
  getPlaceFeaturesService,
  getFeatureCategoriesService,
  getAllFeaturesService,
  removeFeatureFromPlaceService
} = require('../services/featureService');
const ApiError = require('../exceptions/apiError');

class FeatureController {
  async create(req, res, next) {
    try {
      console.log('Creating feature:', req.body);
      const { name, category_id } = req.body;

      if (!name) {
        return next(ApiError.BadRequest('Не указано название фичи'));
      }
      if (!category_id) {
        return next(ApiError.BadRequest('Не указана категория фичи'));
      }

      const feature = await createFeatureService(name, category_id);
      return res.json(feature);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      console.log('Removing feature:', req.body);
      const { id } = req.body;

      if (!id) {
        return next(ApiError.BadRequest('Не указан ID фичи'));
      }

      await removeFeatureService(id);
      return res.json({});
    } catch (error) {
      next(error);
    }
  }

  async addToPlace(req, res, next) {
    try {
      console.log('Adding feature to place:', req.body);
      const { place_id, feature_id } = req.body;

      if (!place_id || !feature_id) {
        return next(ApiError.BadRequest('Не указан ID места или фичи'));
      }

      const result = await addFeatureToPlaceService(place_id, feature_id);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPlaceFeatures(req, res, next) {
    try {
      console.log('Getting place features:', req.params);
      const { id } = req.params;

      if (!id) {
        return next(ApiError.BadRequest('Не указан ID места'));
      }

      const features = await getPlaceFeaturesService(id);
      return res.json(features);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      console.log('Getting feature categories');
      const categories = await getFeatureCategoriesService();
      return res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      console.log('Getting all features');
      const features = await getAllFeaturesService();
      return res.json(features);
    } catch (error) {
      next(error);
    }
  }

  async removeFromPlace(req, res, next) {
    try {
      console.log('Removing feature from place:', req.body);
      const { place_id, feature_id } = req.body;

      if (!place_id || !feature_id) {
        return next(ApiError.BadRequest('Не указан ID места или фичи'));
      }

      const result = await removeFeatureFromPlaceService(place_id, feature_id);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeatureController(); 