// backend/src/controllers/onePieceController.js

const onePieceTcgService = require('../services/onePieceTcgService');

class OnePieceController {
  async getAllSets(req, res) {
    try {
      const sets = await onePieceTcgService.getAllSets();
      res.json(sets);
    } catch (error) {
      console.error('Error fetching One Piece sets:', error);
      res.status(500).json({ error: 'Failed to fetch One Piece sets' });
    }
  }

  async getSetById(req, res) {
    try {
      const { setId } = req.params;
      const set = await onePieceTcgService.getSetById(setId);
      res.json(set);
    } catch (error) {
      console.error(`Error fetching One Piece set ${req.params.setId}:`, error);
      res.status(500).json({ error: 'Failed to fetch One Piece set' });
    }
  }

  async getAllCards(req, res) {
    try {
      const cards = await onePieceTcgService.getAllSetCards();
      res.json(cards);
    } catch (error) {
      console.error('Error fetching One Piece cards:', error);
      res.status(500).json({ error: 'Failed to fetch One Piece cards' });
    }
  }

  async getCardById(req, res) {
    try {
      const { cardId } = req.params;
      const card = await onePieceTcgService.getCardById(cardId);
      res.json(card);
    } catch (error) {
      console.error(`Error fetching One Piece card ${req.params.cardId}:`, error);
      res.status(500).json({ error: 'Failed to fetch One Piece card' });
    }
  }

  async searchCards(req, res) {
    try {
      const { query, type = 'all' } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const results = await onePieceTcgService.searchCards(query, type);
      res.json(results);
    } catch (error) {
      console.error('Error searching One Piece cards:', error);
      res.status(500).json({ error: 'Failed to search One Piece cards' });
    }
  }

  async getFilteredCards(req, res) {
    try {
      const filters = {
        color: req.query.color,
        category: req.query.category,
        rarity: req.query.rarity,
        attribute: req.query.attribute,
        cost: req.query.cost,
        power: req.query.power,
        counter: req.query.counter
      };

      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
          delete filters[key];
        }
      });

      const cards = await onePieceTcgService.getFilteredSetCards(filters);
      res.json(cards);
    } catch (error) {
      console.error('Error fetching filtered One Piece cards:', error);
      res.status(500).json({ error: 'Failed to fetch filtered One Piece cards' });
    }
  }

  async getRecentCards(req, res) {
    try {
      const cards = await onePieceTcgService.getRecentCards();
      res.json(cards);
    } catch (error) {
      console.error('Error fetching recent One Piece cards:', error);
      res.status(500).json({ error: 'Failed to fetch recent One Piece cards' });
    }
  }

  async getAllStarterDecks(req, res) {
    try {
      const decks = await onePieceTcgService.getAllStarterDecks();
      res.json(decks);
    } catch (error) {
      console.error('Error fetching One Piece starter decks:', error);
      res.status(500).json({ error: 'Failed to fetch One Piece starter decks' });
    }
  }

  async getStarterDeckById(req, res) {
    try {
      const { stId } = req.params;
      const deck = await onePieceTcgService.getStarterDeckById(stId);
      res.json(deck);
    } catch (error) {
      console.error(`Error fetching One Piece starter deck ${req.params.stId}:`, error);
      res.status(500).json({ error: 'Failed to fetch One Piece starter deck' });
    }
  }

  async getAllPromoCards(req, res) {
    try {
      const promos = await onePieceTcgService.getAllPromoCards();
      res.json(promos);
    } catch (error) {
      console.error('Error fetching One Piece promo cards:', error);
      res.status(500).json({ error: 'Failed to fetch One Piece promo cards' });
    }
  }

  async getPromoCardById(req, res) {
    try {
      const { cardId } = req.params;
      const card = await onePieceTcgService.getPromoCardById(cardId);
      res.json(card);
    } catch (error) {
      console.error(`Error fetching One Piece promo card ${req.params.cardId}:`, error);
      res.status(500).json({ error: 'Failed to fetch One Piece promo card' });
    }
  }
}

module.exports = new OnePieceController();
