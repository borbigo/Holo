// backend/src/services/onePieceTcgService.js

const axios = require('axios');

const ONE_PIECE_API_BASE = 'https://optcgapi.com/api';

const onePieceApi = axios.create({
  baseURL: ONE_PIECE_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

class OnePieceTcgService {
  async retryRequest(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        console.log(`Retry ${i + 1}/${retries} after error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  async getAllSets() {
    try {
      const response = await onePieceApi.get('/allSets/');
      return response.data;
    } catch (error) {
      console.error('Error fetching One Piece sets:', error.message);
      throw new Error('Failed to fetch One Piece sets');
    }
  }

  async getAllSetCards() {
    try {
      const response = await onePieceApi.get('/allSetCards/');
      return response.data;
    } catch (error) {
      console.error('Error fetching One Piece set cards:', error.message);
      throw new Error('Failed to fetch One Piece set cards');
    }
  }

  async getSetById(setId) {
    try {
      const response = await onePieceApi.get(`/sets/${setId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching One Piece set ${setId}:`, error.message);
      throw new Error(`Failed to fetch One Piece set ${setId}`);
    }
  }

  async getCardById(cardId) {
    try {
      const response = await onePieceApi.get(`/sets/card/${cardId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching One Piece card ${cardId}:`, error.message);
      throw new Error(`Failed to fetch One Piece card ${cardId}`);
    }
  }

  async getFilteredSetCards(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.color) params.append('color', filters.color);
      if (filters.category) params.append('category', filters.category);
      if (filters.rarity) params.append('rarity', filters.rarity);
      if (filters.attribute) params.append('attribute', filters.attribute);
      if (filters.cost) params.append('cost', filters.cost);
      if (filters.power) params.append('power', filters.power);
      if (filters.counter) params.append('counter', filters.counter);

      const response = await onePieceApi.get(`/sets/filtered/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered One Piece cards:', error.message);
      throw new Error('Failed to fetch filtered One Piece cards');
    }
  }

  async getRecentCards() {
    try {
      const response = await onePieceApi.get('/sets/card/twoweeks/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent One Piece cards:', error.message);
      throw new Error('Failed to fetch recent One Piece cards');
    }
  }

  async getAllStarterDecks() {
    try {
      const response = await onePieceApi.get('/allDecks/');
      return response.data;
    } catch (error) {
      console.error('Error fetching One Piece starter decks:', error.message);
      throw new Error('Failed to fetch One Piece starter decks');
    }
  }

  async getAllStarterDeckCards() {
    try {
      const response = await onePieceApi.get('/allSTCards/');
      return response.data;
    } catch (error) {
      console.error('Error fetching One Piece starter deck cards:', error.message);
      throw new Error('Failed to fetch One Piece starter deck cards');
    }
  }

  async getStarterDeckById(stId) {
    try {
      const response = await onePieceApi.get(`/decks/${stId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching One Piece starter deck ${stId}:`, error.message);
      throw new Error(`Failed to fetch One Piece starter deck ${stId}`);
    }
  }

  async getStarterDeckCardById(cardId) {
    try {
      const response = await onePieceApi.get(`/decks/card/${cardId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching One Piece starter deck card ${cardId}:`, error.message);
      throw new Error(`Failed to fetch One Piece starter deck card ${cardId}`);
    }
  }

  async getFilteredStarterDeckCards(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.color) params.append('color', filters.color);
      if (filters.category) params.append('category', filters.category);
      if (filters.rarity) params.append('rarity', filters.rarity);
      if (filters.attribute) params.append('attribute', filters.attribute);
      if (filters.cost) params.append('cost', filters.cost);
      if (filters.power) params.append('power', filters.power);
      if (filters.counter) params.append('counter', filters.counter);

      const response = await onePieceApi.get(`/decks/filtered/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered One Piece starter deck cards:', error.message);
      throw new Error('Failed to fetch filtered One Piece starter deck cards');
    }
  }

  async getAllPromoCards() {
    try {
      const response = await onePieceApi.get('/allPromoCards/');
      return response.data;
    } catch (error) {
      console.error('Error fetching One Piece promo cards:', error.message);
      throw new Error('Failed to fetch One Piece promo cards');
    }
  }

  async getPromoCardById(cardId) {
    try {
      const response = await onePieceApi.get(`/promos/card/${cardId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching One Piece promo card ${cardId}:`, error.message);
      throw new Error(`Failed to fetch One Piece promo card ${cardId}`);
    }
  }

  async getFilteredPromoCards(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.color) params.append('color', filters.color);
      if (filters.category) params.append('category', filters.category);
      if (filters.rarity) params.append('rarity', filters.rarity);
      if (filters.attribute) params.append('attribute', filters.attribute);

      const response = await onePieceApi.get(`/promos/filtered/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered One Piece promo cards:', error.message);
      throw new Error('Failed to fetch filtered One Piece promo cards');
    }
  }

  async searchCards(query, type = 'all') {
    try {
      const results = {};

      // Search set cards
      if (type === 'all' || type === 'set') {
        try {
          const setCards = await this.getAllSetCards();
          results.setCards = setCards.filter(card => 
            card.card_name?.toLowerCase().includes(query.toLowerCase()) ||
            card.card_set_id?.toLowerCase().includes(query.toLowerCase()) ||
            card.card_image_id?.toLowerCase().includes(query.toLowerCase())
          );
        } catch (error) {
          console.error('Error searching set cards:', error.message);
          results.setCards = [];
        }
      }

      // Search starter deck cards
      if (type === 'all' || type === 'starter') {
        try {
          const starterCards = await this.getAllStarterDeckCards();
          results.starterCards = starterCards.filter(card =>
            card.card_name?.toLowerCase().includes(query.toLowerCase()) ||
            card.card_set_id?.toLowerCase().includes(query.toLowerCase()) ||
            card.card_image_id?.toLowerCase().includes(query.toLowerCase())
          );
        } catch (error) {
          console.error('Error searching starter deck cards:', error.message);
          results.starterCards = [];
        }
      }

      // Search promo cards (optional - skip if API doesn't support)
      if (type === 'all' || type === 'promo') {
        try {
          const promoCards = await this.getAllPromoCards();
          results.promoCards = promoCards.filter(card =>
            card.card_name?.toLowerCase().includes(query.toLowerCase()) ||
            card.card_set_id?.toLowerCase().includes(query.toLowerCase()) ||
            card.card_image_id?.toLowerCase().includes(query.toLowerCase())
          );
        } catch (error) {
          console.error('Error searching promo cards (skipping):', error.message);
          results.promoCards = [];
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching One Piece cards:', error.message);
      throw new Error('Failed to search One Piece cards');
    }
  }
}

module.exports = new OnePieceTcgService();
