// src/services/pokemonTcgService.js
const axios = require('axios');

const POKEMON_TCG_API_BASE = 'https://api.pokemontcg.io/v2';

// Create axios instance with default config
const pokemonTcgApi = axios.create({
  baseURL: POKEMON_TCG_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Add API key if available
if (process.env.POKEMON_TCG_API_KEY) {
  pokemonTcgApi.defaults.headers['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
}

class PokemonTcgService {
  /**
   * Retry helper for API calls
   */
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
  
  /**
   * Fetch all sets from Pokemon TCG API
   */
  async getAllSets() {
    try {
      const response = await pokemonTcgApi.get('/sets');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sets:', error.message);
      throw new Error('Failed to fetch sets from Pokemon TCG API');
    }
  }

  /**
   * Fetch a specific set by ID
   */
  async getSetById(setId) {
    try {
      const response = await pokemonTcgApi.get(`/sets/${setId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching set ${setId}:`, error.message);
      throw new Error(`Failed to fetch set ${setId}`);
    }
  }

  /**
   * Fetch cards with optional filters
   * @param {Object} params - Query parameters (page, pageSize, q for search query)
   */
  async getCards(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        pageSize: 250 // Max allowed by API
      };

      const response = await pokemonTcgApi.get('/cards', {
        params: { ...defaultParams, ...params }
      });

      return {
        cards: response.data.data,
        page: response.data.page,
        pageSize: response.data.pageSize,
        count: response.data.count,
        totalCount: response.data.totalCount
      };
    } catch (error) {
      console.error('Error fetching cards:', error.message);
      throw new Error('Failed to fetch cards from Pokemon TCG API');
    }
  }

  /**
   * Fetch cards by set ID
   */
  async getCardsBySet(setId, page = 1) {
    try {
      return await this.getCards({
        q: `set.id:${setId}`,
        page: page,
        pageSize: 250
      });
    } catch (error) {
      console.error(`Error fetching cards for set ${setId}:`, error.message);
      throw error;
    }
  }

  /**
   * Search cards by name
   */
  async searchCards(searchTerm, page = 1) {
    try {
      return await this.getCards({
        q: `name:${searchTerm}*`,
        page: page,
        pageSize: 50
      });
    } catch (error) {
      console.error(`Error searching cards with term "${searchTerm}":`, error.message);
      throw error;
    }
  }

  /**
   * Get a specific card by ID
   */
  async getCardById(cardId) {
    try {
      const response = await pokemonTcgApi.get(`/cards/${cardId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching card ${cardId}:`, error.message);
      throw new Error(`Failed to fetch card ${cardId}`);
    }
  }

  /**
   * Get card with price data
   * Note: Pokemon TCG API includes price data in card responses
   */
  async getCardWithPrices(cardId) {
    try {
      const card = await this.getCardById(cardId);
      return {
        card,
        prices: card.tcgplayer?.prices || null
      };
    } catch (error) {
      console.error(`Error fetching card prices for ${cardId}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch all cards from a set (handles pagination)
   */
  async getAllCardsFromSet(setId) {
    const allCards = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await this.getCardsBySet(setId, currentPage);
      allCards.push(...response.cards);

      hasMorePages = response.page < Math.ceil(response.totalCount / response.pageSize);
      currentPage++;

      // Add a small delay to avoid rate limiting
      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allCards;
  }

  /**
   * Get recent sets (last N sets by release date)
   */
  async getRecentSets(limit = 10) {
    try {
      const sets = await this.getAllSets();
      // Sort by release date descending
      return sets
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent sets:', error.message);
      throw error;
    }
  }
}

module.exports = new PokemonTcgService();