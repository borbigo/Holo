// src/pages/CardsPage.js
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
  IconButton,
  Button,
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

  // Fetch cards whenever filters or page changes
  useEffect(() => {
    dispatch(fetchCards({ 
      page: currentPage, 
      limit: 20,
      search: filters.search 
    }));
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

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

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
                    <IconButton onClick={handleClearSearch} edge="end" size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" sx={{ minWidth: '100px' }}>
              Search
            </Button>
          </Box>
        </form>

        {filters.search && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`Searching for: "${filters.search}"`}
              onDelete={handleClearSearch}
              color="primary"
            />
          </Box>
        )}
      </Box>

      {error && <ErrorMessage error={error} />}

      {loading && <Loading message="Loading cards..." />}

      {!loading && cards.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No cards found. Try a different search term.
          </Typography>
        </Box>
      )}

      {!loading && cards.length > 0 && (
        <>
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                <Card
                  sx={{
                    height: '100%',
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
                  <CardMedia
                    component="img"
                    image={card.imageUrl || 'https://via.placeholder.com/245x342?text=No+Image'}
                    alt={card.name}
                    sx={{
                      height: 342,
                      objectFit: 'contain',
                      bgcolor: '#f5f5f5',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {card.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.setName} • #{card.number}
                    </Typography>
                    {card.rarity && (
                      <Chip
                        label={card.rarity}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}
                    {card.latestPrice && (
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        {formatPrice(card.latestPrice.marketPrice)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CardsPage;