// frontend/src/pages/CardsPage.js

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
  Pagination,
  InputAdornment,
  Chip,
  Button,
  Skeleton,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { fetchCards, setFilters, clearFilters } from '../store/slices/cardsSlice';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const CardsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cards, pagination, filters, loading, error } = useSelector((state) => state.cards);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Fetch cards whenever filters or page changes
  useEffect(() => {
    dispatch(fetchCards({ 
      page: currentPage, 
      limit: 20,
      search: filters.search 
    }));
    // Reset image loading states when page changes
    setImageLoadingStates({});
  }, [dispatch, currentPage, filters.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on new search
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    dispatch(clearFilters());
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (cardId) => {
    navigate(`/cards/${cardId}`);
  };

  const handleImageLoad = (cardId) => {
    setImageLoadingStates(prev => ({ ...prev, [cardId]: 'loaded' }));
  };

  const handleImageError = (cardId) => {
    setImageLoadingStates(prev => ({ ...prev, [cardId]: 'error' }));
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  if (error) {
    return (
      <Container maxWidth="xl">
        <ErrorMessage error={error} title="Failed to load cards" />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Pokemon Cards
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Browse {pagination.totalCount?.toLocaleString()} cards from the Pokemon TCG
        </Typography>

        <form onSubmit={handleSearchSubmit}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for cards by name..."
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
      </Box>

      {loading && (
        <Loading message="Loading cards..." />
      )}

      {!loading && cards.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No cards found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try a different search term.
          </Typography>
        </Box>
      )}

      {!loading && cards.length > 0 && (
        <>
          <Grid container spacing={3}>
            {cards.map((card) => {
              const isImageLoading = !imageLoadingStates[card.id] || imageLoadingStates[card.id] === 'loading';
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                  <Card
                    sx={{
                      height: 520,
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleCardClick(card.id)}
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
                      {/* Show skeleton while image is loading */}
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
                        image={card.imageUrl || 'https://via.placeholder.com/245x342?text=No+Image'}
                        alt={card.name}
                        loading="lazy"
                        onLoad={() => handleImageLoad(card.id)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/245x342?text=No+Image';
                          handleImageError(card.id);
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
                        component="h2" 
                        gutterBottom 
                        noWrap
                        sx={{ fontSize: '1rem', lineHeight: 1.2, mb: 1 }}
                      >
                        {card.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        gutterBottom
                        noWrap
                        sx={{ fontSize: '0.75rem', mb: 1 }}
                      >
                        {card.setName} • #{card.number}
                      </Typography>
                      {card.rarity && (
                        <Chip
                          label={card.rarity}
                          size="small"
                          sx={{ mb: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      {card.latestPrice && (
                        <Typography 
                          variant="body2" 
                          color="primary" 
                          sx={{ mt: 1, fontWeight: 600, fontSize: '0.875rem' }}
                        >
                          {formatPrice(card.latestPrice.marketPrice)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
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

export default CardsPage;
