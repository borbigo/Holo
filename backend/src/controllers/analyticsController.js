// src/controllers/analyticsController.js
const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  /**
   * GET /api/analytics/top-movers
   * Get top gaining and losing cards
   */
  async getTopMovers(req, res) {
    try {
      const { days = 7, limit = 10 } = req.query;
      
      const topMovers = await analyticsService.getTopMovers(
        parseInt(days),
        parseInt(limit)
      );

      res.json(topMovers);
    } catch (error) {
      console.error('Error fetching top movers:', error);
      res.status(500).json({ error: 'Failed to fetch top movers' });
    }
  }

  /**
   * GET /api/analytics/market-overview
   * Get overall market statistics
   */
  async getMarketOverview(req, res) {
    try {
      const overview = await analyticsService.getMarketOverview();

      if (!overview) {
        return res.status(404).json({ error: 'No market data available' });
      }

      res.json(overview);
    } catch (error) {
      console.error('Error fetching market overview:', error);
      res.status(500).json({ error: 'Failed to fetch market overview' });
    }
  }

  /**
   * GET /api/analytics/sets
   * Get analytics for recent sets
   */
  async getSetAnalytics(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const setStats = await analyticsService.getSetAnalytics(parseInt(limit));

      res.json({ sets: setStats });
    } catch (error) {
      console.error('Error fetching set analytics:', error);
      res.status(500).json({ error: 'Failed to fetch set analytics' });
    }
  }

  /**
   * GET /api/analytics/cards/:cardId/trend
   * Get price trend for a specific card
   */
  async getCardTrend(req, res) {
    try {
      const { cardId } = req.params;
      const { days = 30 } = req.query;

      const trend = await analyticsService.getCardPriceTrend(cardId, parseInt(days));

      if (!trend) {
        return res.status(404).json({ error: 'No price data available for this card' });
      }

      res.json(trend);
    } catch (error) {
      console.error('Error fetching card trend:', error);
      res.status(500).json({ error: 'Failed to fetch card price trend' });
    }
  }
}

module.exports = new AnalyticsController();