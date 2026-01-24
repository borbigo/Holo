// src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/top-movers - Get top gaining/losing cards
router.get('/top-movers', analyticsController.getTopMovers);

// GET /api/analytics/market-overview - Get market statistics
router.get('/market-overview', analyticsController.getMarketOverview);

// GET /api/analytics/sets - Get set analytics
router.get('/sets', analyticsController.getSetAnalytics);

// GET /api/analytics/cards/:cardId/trend - Get price trend for specific card
router.get('/cards/:cardId/trend', analyticsController.getCardTrend);

module.exports = router;