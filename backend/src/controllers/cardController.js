// src/controllers/cardController.js
const prisma = require('../config/database');

class CardController {
  /**
   * Get all cards with pagination and filtering
   * Query params: page, limit, search, setId, rarity, type
   */
  async getAllCards(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        setId = '',
        rarity = '',
        type = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where = {};

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive'
        };
      }

      if (setId) {
        where.setId = setId;
      }

      if (rarity) {
        where.rarity = {
          contains: rarity,
          mode: 'insensitive'
        };
      }

      if (type) {
        where.types = {
          has: type
        };
      }

      // Build orderBy
      const orderBy = {};
      orderBy[sortBy] = sortOrder;

      // Get cards with pagination
      const [cards, totalCount] = await Promise.all([
        prisma.card.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            set: {
              select: {
                id: true,
                name: true,
                series: true,
                releaseDate: true,
                logoUrl: true
              }
            },
            priceHistory: {
              orderBy: { date: 'desc' },
              take: 1
            }
          }
        }),
        prisma.card.count({ where })
      ]);

      // Format response with latest price
      const formattedCards = cards.map(card => ({
        ...card,
        latestPrice: card.priceHistory[0] || null,
        priceHistory: undefined // Remove full history from list view
      }));

      res.json({
        cards: formattedCards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching cards:', error);
      res.status(500).json({ error: 'Failed to fetch cards' });
    }
  }

  /**
   * Get a single card by ID with full details
   */
  async getCardById(req, res) {
    try {
      const { id } = req.params;

      const card = await prisma.card.findUnique({
        where: { id },
        include: {
          set: true,
          priceHistory: {
            orderBy: { date: 'desc' },
            take: 30 // Last 30 price records
          }
        }
      });

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      res.json(card);
    } catch (error) {
      console.error('Error fetching card:', error);
      res.status(500).json({ error: 'Failed to fetch card' });
    }
  }

  /**
   * Search cards by name
   */
  async searchCards(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.json({ cards: [] });
      }

      const cards = await prisma.card.findMany({
        where: {
          name: {
            contains: q,
            mode: 'insensitive'
          }
        },
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        include: {
          set: {
            select: {
              name: true,
              series: true
            }
          },
          priceHistory: {
            orderBy: { date: 'desc' },
            take: 1
          }
        }
      });

      const formattedCards = cards.map(card => ({
        id: card.id,
        name: card.name,
        setName: card.setName,
        number: card.number,
        imageUrl: card.imageUrl,
        rarity: card.rarity,
        latestPrice: card.priceHistory[0]?.marketPrice || null
      }));

      res.json({ cards: formattedCards });
    } catch (error) {
      console.error('Error searching cards:', error);
      res.status(500).json({ error: 'Failed to search cards' });
    }
  }

  /**
   * Get card price history
   */
  async getCardPriceHistory(req, res) {
    try {
      const { id } = req.params;
      const { days = 30 } = req.query;

      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - parseInt(days));

      const priceHistory = await prisma.priceHistory.findMany({
        where: {
          cardId: id,
          date: {
            gte: dateLimit
          }
        },
        orderBy: { date: 'asc' }
      });

      if (priceHistory.length === 0) {
        return res.status(404).json({ error: 'No price history found for this card' });
      }

      res.json({ priceHistory });
    } catch (error) {
      console.error('Error fetching price history:', error);
      res.status(500).json({ error: 'Failed to fetch price history' });
    }
  }

  /**
   * Get cards by set
   */
  async getCardsBySet(req, res) {
    try {
      const { setId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [cards, totalCount] = await Promise.all([
        prisma.card.findMany({
          where: { setId },
          skip,
          take,
          orderBy: { number: 'asc' },
          include: {
            priceHistory: {
              orderBy: { date: 'desc' },
              take: 1
            }
          }
        }),
        prisma.card.count({ where: { setId } })
      ]);

      const formattedCards = cards.map(card => ({
        ...card,
        latestPrice: card.priceHistory[0] || null,
        priceHistory: undefined
      }));

      res.json({
        cards: formattedCards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching cards by set:', error);
      res.status(500).json({ error: 'Failed to fetch cards by set' });
    }
  }

  /**
   * Get card statistics
   */
  async getCardStats(req, res) {
    try {
      const stats = await prisma.card.groupBy({
        by: ['rarity'],
        _count: {
          id: true
        }
      });

      const totalCards = await prisma.card.count();
      const totalSets = await prisma.set.count();
      const totalPriceRecords = await prisma.priceHistory.count();

      res.json({
        totalCards,
        totalSets,
        totalPriceRecords,
        cardsByRarity: stats
      });
    } catch (error) {
      console.error('Error fetching card stats:', error);
      res.status(500).json({ error: 'Failed to fetch card statistics' });
    }
  }
}

module.exports = new CardController();