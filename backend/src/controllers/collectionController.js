// src/controllers/collectionController.js
const prisma = require('../config/database');

class CollectionController {
  /**
   * GET /api/collections
   * Get all collections for the logged-in user
   */
  async getUserCollections(req, res) {
    try {
      const collections = await prisma.collection.findMany({
        where: { userId: req.userId },
        include: {
          items: {
            include: {
              card: {
                include: {
                  priceHistory: {
                    orderBy: { date: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate stats for each collection
      const collectionsWithStats = collections.map(collection => {
        const totalCards = collection.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = collection.items.reduce((sum, item) => {
          const currentPrice = item.card.priceHistory[0]?.marketPrice || 0;
          return sum + (currentPrice * item.quantity);
        }, 0);
        const totalCost = collection.items.reduce((sum, item) => {
          return sum + ((item.purchasePrice || 0) * item.quantity);
        }, 0);
        const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

        return {
          ...collection,
          stats: {
            totalCards,
            totalValue,
            totalCost,
            roi,
          },
        };
      });

      res.json({ collections: collectionsWithStats });
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ error: 'Failed to fetch collections' });
    }
  }

  /**
   * POST /api/collections
   * Create a new collection
   */
  async createCollection(req, res) {
    try {
      const { name, description, isPublic } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Collection name is required' });
      }

      const collection = await prisma.collection.create({
        data: {
          name,
          description: description || null,
          isPublic: isPublic || false,
          userId: req.userId,
        },
      });

      res.status(201).json({ collection });
    } catch (error) {
      console.error('Error creating collection:', error);
      res.status(500).json({ error: 'Failed to create collection' });
    }
  }

  /**
   * GET /api/collections/:id
   * Get a specific collection with all items
   */
  async getCollectionById(req, res) {
    try {
      const { id } = req.params;

      const collection = await prisma.collection.findFirst({
        where: {
          id,
          userId: req.userId,
        },
        include: {
          items: {
            include: {
              card: {
                include: {
                  priceHistory: {
                    orderBy: { date: 'desc' },
                    take: 1,
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      // Calculate stats
      const totalCards = collection.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = collection.items.reduce((sum, item) => {
        const currentPrice = item.card.priceHistory[0]?.marketPrice || 0;
        return sum + (currentPrice * item.quantity);
      }, 0);
      const totalCost = collection.items.reduce((sum, item) => {
        return sum + ((item.purchasePrice || 0) * item.quantity);
      }, 0);
      const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

      res.json({
        collection: {
          ...collection,
          stats: { totalCards, totalValue, totalCost, roi },
        },
      });
    } catch (error) {
      console.error('Error fetching collection:', error);
      res.status(500).json({ error: 'Failed to fetch collection' });
    }
  }

  /**
   * PUT /api/collections/:id
   * Update a collection
   */
  async updateCollection(req, res) {
    try {
      const { id } = req.params;
      const { name, description, isPublic } = req.body;

      const collection = await prisma.collection.updateMany({
        where: {
          id,
          userId: req.userId,
        },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isPublic !== undefined && { isPublic }),
        },
      });

      if (collection.count === 0) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      const updated = await prisma.collection.findUnique({
        where: { id },
      });

      res.json({ collection: updated });
    } catch (error) {
      console.error('Error updating collection:', error);
      res.status(500).json({ error: 'Failed to update collection' });
    }
  }

  /**
   * DELETE /api/collections/:id
   * Delete a collection
   */
  async deleteCollection(req, res) {
    try {
      const { id } = req.params;

      const deleted = await prisma.collection.deleteMany({
        where: {
          id,
          userId: req.userId,
        },
      });

      if (deleted.count === 0) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
      console.error('Error deleting collection:', error);
      res.status(500).json({ error: 'Failed to delete collection' });
    }
  }

  /**
   * POST /api/collections/:id/items
   * Add a card to a collection
   */
  async addCardToCollection(req, res) {
    try {
      const { id } = req.params;
      const { cardId, quantity, condition, purchasePrice, purchaseDate, gradingCompany, gradingScore, notes } = req.body;

      if (!cardId) {
        return res.status(400).json({ error: 'Card ID is required' });
      }

      // Verify collection belongs to user
      const collection = await prisma.collection.findFirst({
        where: { id, userId: req.userId },
      });

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      // Check if card exists
      const card = await prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      // Add item to collection
      const item = await prisma.collectionItem.create({
        data: {
          collectionId: id,
          cardId,
          quantity: quantity || 1,
          condition: condition || 'near_mint',
          purchasePrice: purchasePrice || null,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          gradingCompany: gradingCompany || null,
          gradingScore: gradingScore || null,
          notes: notes || null,
        },
        include: {
          card: {
            include: {
              priceHistory: {
                orderBy: { date: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      res.status(201).json({ item });
    } catch (error) {
      console.error('Error adding card to collection:', error);
      res.status(500).json({ error: 'Failed to add card to collection' });
    }
  }

  /**
   * DELETE /api/collections/:collectionId/items/:itemId
   * Remove a card from collection
   */
  async removeCardFromCollection(req, res) {
    try {
      const { collectionId, itemId } = req.params;

      // Verify collection belongs to user
      const collection = await prisma.collection.findFirst({
        where: { id: collectionId, userId: req.userId },
      });

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      await prisma.collectionItem.delete({
        where: { id: itemId },
      });

      res.json({ message: 'Card removed from collection' });
    } catch (error) {
      console.error('Error removing card from collection:', error);
      res.status(500).json({ error: 'Failed to remove card from collection' });
    }
  }
}

module.exports = new CollectionController();