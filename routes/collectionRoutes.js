const express = require('express');
const router = express.Router();
const { Collections, CollectionPlace } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Get all collections
router.get('/', async (req, res) => {
    try {
        const collections = await Collections.findAll({
            include: ['places']
        });
        res.json(collections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching collections", error: error.message });
    }
});

// Get single collection by ID
router.get('/:id', async (req, res) => {
    try {
        const collection = await Collections.findByPk(req.params.id, {
            include: ['places']
        });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.json(collection);
    } catch (error) {
        res.status(500).json({ message: "Error fetching collection", error: error.message });
    }
});

// Create new collection
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, places_ids } = req.body;
        console.log('Request body:', req.body);
        console.log('Description value:', description);
        
        const collection = await Collections.create({ 
            name, 
            description: description || null 
        });
        console.log('Created collection:', collection.toJSON());

        if (places_ids && Array.isArray(places_ids)) {
            await CollectionPlace.bulkCreate(
                places_ids.map(placeId => ({
                    collection_id: collection.id,
                    place_id: placeId
                }))
            );
        }

        const newCollection = await Collections.findByPk(collection.id, {
            include: ['places']
        });
        res.status(201).json(newCollection);
    } catch (error) {
        res.status(500).json({ message: "Error creating collection", error: error.message });
    }
});

// Update collection
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, places } = req.body;
        const collection = await Collections.findByPk(req.params.id);
        
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }

        await collection.update({ name });

        if (places && Array.isArray(places)) {
            // Remove existing places
            await CollectionPlace.destroy({
                where: { collection_id: collection.id }
            });
            
            // Add new places
            await CollectionPlace.bulkCreate(
                places.map(placeId => ({
                    collection_id: collection.id,
                    place_id: placeId
                }))
            );
        }

        const updatedCollection = await Collections.findByPk(collection.id, {
            include: ['places']
        });
        res.json(updatedCollection);
    } catch (error) {
        res.status(500).json({ message: "Error updating collection", error: error.message });
    }
});

// Delete collection
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const collection = await Collections.findByPk(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        
        await CollectionPlace.destroy({
            where: { collection_id: collection.id }
        });
        
        await collection.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting collection", error: error.message });
    }
});

// Add place to collection
router.post('/:id/places', authMiddleware, async (req, res) => {
    try {
        const { place_id } = req.body;
        const collection = await Collections.findByPk(req.params.id);
        
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }

        await CollectionPlace.create({
            collection_id: collection.id,
            place_id
        });

        const updatedCollection = await Collections.findByPk(collection.id, {
            include: ['places']
        });
        res.json(updatedCollection);
    } catch (error) {
        res.status(500).json({ message: "Error adding place to collection", error: error.message });
    }
});

// Remove place from collection
router.delete('/:id/places/:placeId', authMiddleware, async (req, res) => {
    try {
        const { id, placeId } = req.params;
        const result = await CollectionPlace.destroy({
            where: {
                collection_id: id,
                place_id: placeId
            }
        });

        if (result === 0) {
            return res.status(404).json({ message: "Place not found in collection" });
        }

        const updatedCollection = await Collections.findByPk(id, {
            include: ['places']
        });
        res.json(updatedCollection);
    } catch (error) {
        res.status(500).json({ message: "Error removing place from collection", error: error.message });
    }
});

module.exports = router;
