// src/routes/cardRoutes.js
const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// GET /api/cards - Get all cards with filtering and pagination
router.get('/', cardController.getAllCards);

// GET /api/cards/search - Search cards
router.get('/search', cardController.searchCards);

// GET /api/cards/stats - Get card statistics
router.get('/stats', cardController.getCardStats);

// GET /api/cards/set/:setId - Get all cards from a specific set (BEFORE /:id)
router.get('/set/:setId', cardController.getCardsBySet);

// GET /api/cards/:id - Get single card by ID
router.get('/:id', cardController.getCardById);

// GET /api/cards/:id/prices - Get price history for a card
router.get('/:id/prices', cardController.getCardPriceHistory);

module.exports = router;