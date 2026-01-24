// src/services/analyticsService.js
const prisma = require('../config/database');

class AnalyticsService {
  /**
   * Calculate price change percentage
   */
  calculatePriceChange(oldPrice, newPrice) {
    if (!oldPrice || oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  }

  /**
   * Get top movers (cards with biggest price changes)
   */
  async getTopMovers(days = 7, limit = 10) {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      // Get all cards that have price history in the timeframe
      const cards = await prisma.card.findMany({
        where: {
          priceHistory: {
            some: {
              date: { gte: dateLimit }
            }
          }
        },
        include: {
          priceHistory: {
            orderBy: { date: 'desc' },
            take: 30
          }
        }
      });

      const movers = [];

      for (const card of cards) {
        if (card.priceHistory.length < 2) continue;

        const latestPrice = card.priceHistory[0]?.marketPrice;
        const oldestPrice = card.priceHistory[card.priceHistory.length - 1]?.marketPrice;

        if (!latestPrice || !oldestPrice) continue;

        const percentChange = this.calculatePriceChange(oldestPrice, latestPrice);
        const priceChange = latestPrice - oldestPrice;

        movers.push({
          cardId: card.id,
          name: card.name,
          setName: card.setName,
          imageUrl: card.imageUrl,
          currentPrice: latestPrice,
          oldPrice: oldestPrice,
          priceChange: priceChange,
          percentChange: percentChange,
          daysTracked: days
        });
      }

      // Sort by absolute percent change and get top movers
      const topGainers = movers
        .filter(m => m.percentChange > 0)
        .sort((a, b) => b.percentChange - a.percentChange)
        .slice(0, limit);

      const topLosers = movers
        .filter(m => m.percentChange < 0)
        .sort((a, b) => a.percentChange - b.percentChange)
        .slice(0, limit);

      return {
        topGainers,
        topLosers,
        totalCardsTracked: movers.length
      };
    } catch (error) {
      console.error('Error calculating top movers:', error);
      throw error;
    }
  }

  /**
   * Get market overview statistics
   */
  async getMarketOverview() {
    try {
      // Get latest prices for all cards
      const cardsWithPrices = await prisma.card.findMany({
        include: {
          priceHistory: {
            orderBy: { date: 'desc' },
            take: 1
          }
        }
      });

      const prices = cardsWithPrices
        .map(c => c.priceHistory[0]?.marketPrice)
        .filter(p => p !== null && p !== undefined);

      if (prices.length === 0) {
        return null;
      }

      // Calculate statistics
      const totalCards = prices.length;
      const totalValue = prices.reduce((sum, price) => sum + price, 0);
      const averagePrice = totalValue / totalCards;
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);

      // Calculate median
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const median = sortedPrices.length % 2 === 0
        ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
        : sortedPrices[Math.floor(sortedPrices.length / 2)];

      // Get most expensive cards (top 50)
      const mostExpensive = cardsWithPrices
        .filter(c => c.priceHistory[0]?.marketPrice)
        .sort((a, b) => b.priceHistory[0].marketPrice - a.priceHistory[0].marketPrice)
        .slice(0, 50)
        .map(c => ({
          id: c.id,
          name: c.name,
          setName: c.setName,
          imageUrl: c.imageUrl,
          price: c.priceHistory[0].marketPrice
        }));

      // Price distribution (buckets)
      const priceRanges = {
        under1: 0,
        '1to5': 0,
        '5to10': 0,
        '10to25': 0,
        '25to50': 0,
        '50to100': 0,
        over100: 0
      };

      prices.forEach(price => {
        if (price < 1) priceRanges.under1++;
        else if (price < 5) priceRanges['1to5']++;
        else if (price < 10) priceRanges['5to10']++;
        else if (price < 25) priceRanges['10to25']++;
        else if (price < 50) priceRanges['25to50']++;
        else if (price < 100) priceRanges['50to100']++;
        else priceRanges.over100++;
      });

      return {
        totalCards,
        totalValue,
        averagePrice,
        medianPrice: median,
        maxPrice,
        minPrice,
        mostExpensive,
        priceDistribution: priceRanges
      };
    } catch (error) {
      console.error('Error calculating market overview:', error);
      throw error;
    }
  }

  /**
   * Get set analytics
   */
  async getSetAnalytics(limit = 10) {
    try {
      // First get the sets
      const sets = await prisma.set.findMany({
        orderBy: { releaseDate: 'desc' },
        take: limit
      });

      // Then get card data for each set separately
      const setStats = await Promise.all(sets.map(async (set) => {
        const cards = await prisma.card.findMany({
          where: { setId: set.id },
          include: {
            priceHistory: {
              orderBy: { date: 'desc' },
              take: 1
            }
          }
        });

        const prices = cards
          .map(c => c.priceHistory[0]?.marketPrice)
          .filter(p => p !== null && p !== undefined);

        const totalValue = prices.reduce((sum, price) => sum + price, 0);
        const avgPrice = prices.length > 0 ? totalValue / prices.length : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        return {
          id: set.id,
          name: set.name,
          series: set.series,
          releaseDate: set.releaseDate,
          totalCards: cards.length,
          cardsWithPrices: prices.length,
          totalValue,
          averagePrice: avgPrice,
          maxPrice
        };
      }));

      return setStats;
    } catch (error) {
      console.error('Error calculating set analytics:', error);
      throw error;
    }
  }

  /**
   * Get price trend for a specific card
   */
  async getCardPriceTrend(cardId, days = 30) {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const priceHistory = await prisma.priceHistory.findMany({
        where: {
          cardId,
          date: { gte: dateLimit }
        },
        orderBy: { date: 'asc' }
      });

      if (priceHistory.length === 0) {
        return null;
      }

      const prices = priceHistory.map(p => p.marketPrice).filter(p => p !== null);
      
      if (prices.length === 0) {
        return null;
      }

      const currentPrice = prices[prices.length - 1];
      const oldestPrice = prices[0];
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const priceChange = currentPrice - oldestPrice;
      const percentChange = this.calculatePriceChange(oldestPrice, currentPrice);

      return {
        currentPrice,
        oldestPrice,
        averagePrice: avgPrice,
        maxPrice,
        minPrice,
        priceChange,
        percentChange,
        dataPoints: priceHistory.length,
        daysTracked: days,
        history: priceHistory
      };
    } catch (error) {
      console.error('Error getting card price trend:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();