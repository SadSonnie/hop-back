'use strict';

const { Features, FeatureCategory } = require('../models');
const ApiError = require('../exceptions/apiError');

const createFeatureService = async (name, category_id) => {
    try {
        // Проверяем существование категории
        const category = await FeatureCategory.findByPk(category_id);
        if (!category) {
            throw ApiError.BadRequest('Категория не найдена');
        }

        const feature = await Features.create({ name, category_id });
        return {
            id: feature.id,
            name: feature.name,
            category_id: feature.category_id
        };
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw ApiError.BadRequest('Фича с таким названием уже существует');
        }
        throw error;
    }
};

const removeFeatureService = async (id) => {
    const feature = await Features.findByPk(id);
    if (!feature) {
        throw ApiError.NotFound('Фича не найдена');
    }
    await feature.destroy();
};

const addFeatureToPlaceService = async (place_id, feature_id) => {
    try {
        const feature = await Features.findByPk(feature_id);
        if (!feature) {
            throw ApiError.NotFound('Фича не найдена');
        }

        await feature.addPlaces(place_id);
        return { success: true };
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw ApiError.BadRequest('Эта фича уже добавлена к месту');
        }
        throw error;
    }
};

const getPlaceFeaturesService = async (place_id) => {
    const features = await Features.findAll({
        include: [
            {
                model: FeatureCategory,
                as: 'category',
                attributes: ['id', 'name']
            },
            {
                association: 'places',
                where: { id: place_id },
                attributes: []
            }
        ]
    });

    return features.map(feature => ({
        id: feature.id,
        name: feature.name,
        category: feature.category
    }));
};

const getFeatureCategoriesService = async () => {
    return await FeatureCategory.findAll({
        attributes: ['id', 'name']
    });
};

const getAllFeaturesService = async () => {
    console.log('=== getAllFeaturesService called ===');
    try {
        const features = await Features.findAll({
            include: [{
                model: FeatureCategory,
                as: 'category',
                attributes: ['id', 'name']
            }],
            order: [
                ['category_id', 'ASC'],
                ['name', 'ASC']
            ]
        });

        console.log('Features found:', features.length);
        
        const result = features.map(feature => ({
            id: feature.id,
            name: feature.name,
            category: feature.category
        }));
        
        console.log('=== getAllFeaturesService completed ===');
        return result;
    } catch (error) {
        console.error('Error in getAllFeaturesService:', error);
        throw error;
    }
};

const removeFeatureFromPlaceService = async (place_id, feature_id) => {
    try {
        const feature = await Features.findByPk(feature_id);
        if (!feature) {
            throw ApiError.NotFound('Фича не найдена');
        }

        await feature.removePlaces(place_id);
        return { success: true };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createFeatureService,
    removeFeatureService,
    addFeatureToPlaceService,
    getPlaceFeaturesService,
    getFeatureCategoriesService,
    getAllFeaturesService,
    removeFeatureFromPlaceService
}; 