// backend/src/routes/onePieceRoutes.js

const express = require('express');
const router = express.Router();
const onePieceController = require('../controllers/onePieceController');

// Sets
router.get('/sets', onePieceController.getAllSets);
router.get('/sets/:setId', onePieceController.getSetById);

// Cards
router.get('/cards', onePieceController.getAllCards);
router.get('/cards/search', onePieceController.searchCards);
router.get('/cards/filtered', onePieceController.getFilteredCards);
router.get('/cards/recent', onePieceController.getRecentCards);
router.get('/cards/:cardId', onePieceController.getCardById);

// Starter Decks
router.get('/starter-decks', onePieceController.getAllStarterDecks);
router.get('/starter-decks/:stId', onePieceController.getStarterDeckById);

// Promos
router.get('/promos', onePieceController.getAllPromoCards);
router.get('/promos/:cardId', onePieceController.getPromoCardById);

module.exports = router;
