// src/routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authenticate = require('../middleware/auth');

// All collection routes require authentication
router.use(authenticate);

// GET /api/collections - Get all user collections
router.get('/', collectionController.getUserCollections);

// POST /api/collections - Create new collection
router.post('/', collectionController.createCollection);

// GET /api/collections/:id - Get specific collection
router.get('/:id', collectionController.getCollectionById);

// PUT /api/collections/:id - Update collection
router.put('/:id', collectionController.updateCollection);

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', collectionController.deleteCollection);

// POST /api/collections/:id/items - Add card to collection
router.post('/:id/items', collectionController.addCardToCollection);

// DELETE /api/collections/:collectionId/items/:itemId - Remove card from collection
router.delete('/:collectionId/items/:itemId', collectionController.removeCardFromCollection);

module.exports = router;