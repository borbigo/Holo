// frontend/src/pages/OnePieceCardsPage.js

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  Box,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Skeleton,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import {
  fetchOnePieceCards,
} from '../store/slices/onePieceSlice';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const CARDS_PER_PAGE = 20;

const OnePieceCardsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cards, loading, error } = useSelector((state) => state.onePiece);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [displayCards, setDisplayCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Pagination calculations
  const totalPages = Math.ceil(displayCards.length / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const paginatedCards = displayCards.slice(startIndex, endIndex);

  useEffect(() => {
    dispatch(fetchOnePieceCards());
  }, [dispatch]);

  useEffect(() => {
    let filtered = [...cards];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(card => {
        const cardName = (card.card_name || '').toLowerCase();
        const cardId = (card.card_set_id || card.card_image_id || '').toLowerCase();
        return cardName.includes(query) || cardId.includes(query);
      });
    }

    if (colorFilter) {
      filtered = filtered.filter(card => 
        (card.card_color || card.color) === colorFilter
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(card => 
        (card.card_type || card.category) === categoryFilter
      );
    }

    if (rarityFilter) {
      filtered = filtered.filter(card => 
        card.rarity === rarityFilter
      );
    }

    setDisplayCards(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
    setImageLoadingStates({}); // Reset image states
  }, [cards, searchTerm, colorFilter, categoryFilter, rarityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setColorFilter('');
    setCategoryFilter('');
    setRarityFilter('');
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (cardId) => {
    navigate(`/onepiece/cards/${cardId}`);
  };

  const handleImageLoad = (uniqueKey) => {
    setImageLoadingStates(prev => ({ ...prev, [uniqueKey]: 'loaded' }));
  };

  const handleImageError = (uniqueKey) => {
    setImageLoadingStates(prev => ({ ...prev, [uniqueKey]: 'error' }));
  };

  const getCardImage = (card) => {
    const imageUrl = card.card_image || card.image_url || card.imageUrl;
    return imageUrl || 'https://via.placeholder.com/245x342?text=No+Image';
  };

  const getCardId = (card) => {
    // Prioritize card_image_id as it's more specific for variants/alternate arts
    return card.card_image_id || card.card_set_id || card.id || card.card_id;
  };

  const getCardName = (card) => {
    return card.card_name || card.name || 'Unknown Card';
  };

  const getCardColor = (card) => {
    return card.card_color || card.color;
  };

  const getCardType = (card) => {
    return card.card_type || card.category;
  };

  const getColorHex = (color) => {
    const colorMap = {
      Red: '#e74c3c',
      Green: '#27ae60',
      Blue: '#3498db',
      Purple: '#9b59b6',
      Black: '#34495e',
      Yellow: '#f39c12',
    };
    return colorMap[color] || '#95a5a6';
  };

  if (error) {
    return (
      <Container maxWidth="xl">
        <ErrorMessage error={error} title="Failed to load One Piece cards" />
      </Container>
    );
  }

  const activeFilterCount = [colorFilter, categoryFilter, rarityFilter, searchTerm].filter(f => f !== '').length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          One Piece TCG Cards
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {searchTerm || activeFilterCount > 0 ? (
            <>Showing {displayCards.length.toLocaleString()} of {cards.length.toLocaleString()} cards</>
          ) : (
            <>Browse {displayCards.length.toLocaleString()} cards from the One Piece Trading Card Game</>
          )}
        </Typography>

        <form onSubmit={handleSearchSubmit}>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for cards by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={handleClearSearch}
                      startIcon={<ClearIcon />}
                    >
                      Clear
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </form>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Color</InputLabel>
            <Select
              value={colorFilter}
              label="Color"
              onChange={(e) => setColorFilter(e.target.value)}
            >
              <MenuItem value="">All Colors</MenuItem>
              <MenuItem value="Red">Red</MenuItem>
              <MenuItem value="Green">Green</MenuItem>
              <MenuItem value="Blue">Blue</MenuItem>
              <MenuItem value="Purple">Purple</MenuItem>
              <MenuItem value="Black">Black</MenuItem>
              <MenuItem value="Yellow">Yellow</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Leader">Leader</MenuItem>
              <MenuItem value="Character">Character</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
              <MenuItem value="Stage">Stage</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Rarity</InputLabel>
            <Select
              value={rarityFilter}
              label="Rarity"
              onChange={(e) => setRarityFilter(e.target.value)}
            >
              <MenuItem value="">All Rarities</MenuItem>
              <MenuItem value="C">Common (C)</MenuItem>
              <MenuItem value="UC">Uncommon (UC)</MenuItem>
              <MenuItem value="R">Rare (R)</MenuItem>
              <MenuItem value="SR">Super Rare (SR)</MenuItem>
              <MenuItem value="SEC">Secret Rare (SEC)</MenuItem>
              <MenuItem value="L">Leader (L)</MenuItem>
            </Select>
          </FormControl>

          {activeFilterCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
                color="primary"
                size="small"
              />
              <Button size="small" onClick={handleClearFilters}>
                Clear All
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {loading ? (
        <Loading message="Loading One Piece cards..." />
      ) : displayCards.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No cards found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or search
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedCards.map((card, index) => {
              const cardId = getCardId(card);
              const imageUrl = getCardImage(card);
              const cardName = getCardName(card);
              const cardColor = getCardColor(card);
              const cardType = getCardType(card);
              const globalIndex = startIndex + index;
              const uniqueKey = `${cardId}-${globalIndex}`;
              const isImageLoading = !imageLoadingStates[uniqueKey] || imageLoadingStates[uniqueKey] === 'loading';
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={uniqueKey}>
                  <Card
                    sx={{
                      height: 520,
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleCardClick(cardId)}
                  >
                    <Box 
                      sx={{ 
                        height: 342, 
                        width: '100%',
                        flexShrink: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {isImageLoading && (
                        <Skeleton 
                          variant="rectangular" 
                          width="100%" 
                          height="100%"
                          animation="wave"
                          sx={{ position: 'absolute', top: 0, left: 0 }}
                        />
                      )}
                      <CardMedia
                        component="img"
                        image={imageUrl}
                        alt={cardName}
                        loading="lazy"
                        onLoad={() => handleImageLoad(uniqueKey)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/245x342?text=No+Image';
                          handleImageError(uniqueKey);
                        }}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          opacity: isImageLoading ? 0 : 1,
                          transition: 'opacity 0.3s ease-in-out',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, overflow: 'hidden', p: 2 }}>
                      <Typography 
                        variant="h6" 
                        noWrap 
                        gutterBottom
                        sx={{ fontSize: '1rem', lineHeight: 1.2, mb: 1 }}
                      >
                        {cardName}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                        {cardColor && (
                          <Chip
                            label={cardColor}
                            size="small"
                            sx={{
                              bgcolor: getColorHex(cardColor),
                              color: 'white',
                              height: 20,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                        {card.rarity && (
                          <Chip 
                            label={card.rarity} 
                            size="small" 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        noWrap
                        sx={{ fontSize: '0.75rem', mb: 0.5 }}
                      >
                        {cardId}
                      </Typography>
                      {cardType && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem', display: 'block' }}
                        >
                          {cardType}
                        </Typography>
                      )}
                      {card.market_price && (
                        <Typography 
                          variant="body2" 
                          color="primary" 
                          sx={{ mt: 1, fontWeight: 600, fontSize: '0.875rem' }}
                        >
                          ${card.market_price.toFixed(2)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default OnePieceCardsPage;
