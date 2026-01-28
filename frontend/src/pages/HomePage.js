// frontend/src/pages/HomePage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import axios from 'axios';
import HoloLogo from '../components/common/HoloLogo';
import Loading from '../components/common/Loading';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [marketOverview, setMarketOverview] = useState(null);
  const [onePieceCards, setOnePieceCards] = useState([]);
  const [opMarketOverview, setOpMarketOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [opCurrentCardIndex, setOpCurrentCardIndex] = useState(0);

  const featuredCards = marketOverview?.mostExpensive?.slice(0, 8) || [];
  const currentCard = featuredCards[currentCardIndex];

  const opFeaturedCards = onePieceCards.slice(0, 8) || [];
  const opCurrentCard = opFeaturedCards[opCurrentCardIndex];

  // TRUNCATE FUNCTION - JavaScript approach
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (featuredCards.length > 1) {
      const interval = setInterval(() => {
        setCurrentCardIndex((prev) => 
          prev === featuredCards.length - 1 ? 0 : prev + 1
        );
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [featuredCards.length]);

  useEffect(() => {
    if (opFeaturedCards.length > 1) {
      const interval = setInterval(() => {
        setOpCurrentCardIndex((prev) => 
          prev === opFeaturedCards.length - 1 ? 0 : prev + 1
        );
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [opFeaturedCards.length]);

  const fetchData = async () => {
    try {
      const [statsRes, marketRes, onePieceRes] = await Promise.all([
        axios.get(`${API_URL}/cards/stats`),
        axios.get(`${API_URL}/analytics/market-overview`),
        axios.get(`${API_URL}/onepiece/cards`),
      ]);
      
      setStats(statsRes.data);
      setMarketOverview(marketRes.data);
      
      const sortedOnePiece = onePieceRes.data
        .filter(card => card.market_price)
        .sort((a, b) => b.market_price - a.market_price)
        .slice(0, 10);
      setOnePieceCards(sortedOnePiece);

      const allOnePiece = onePieceRes.data.filter(c => c.market_price);
      const prices = allOnePiece.map(c => c.market_price);
      const total = prices.reduce((sum, p) => sum + p, 0);
      const avg = total / prices.length;
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const median = sortedPrices[Math.floor(sortedPrices.length / 2)];
      
      setOpMarketOverview({
        totalCards: allOnePiece.length,
        totalValue: total,
        averagePrice: avg,
        medianPrice: median,
        maxPrice: Math.max(...prices),
        minPrice: Math.min(...prices),
        mostExpensive: sortedOnePiece,
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    if (featuredCards.length > 0) {
      setCurrentCardIndex((prev) => 
        prev === featuredCards.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevCard = () => {
    if (featuredCards.length > 0) {
      setCurrentCardIndex((prev) => 
        prev === 0 ? featuredCards.length - 1 : prev - 1
      );
    }
  };

  const handleOpNextCard = () => {
    if (opFeaturedCards.length > 0) {
      setOpCurrentCardIndex((prev) => 
        prev === opFeaturedCards.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleOpPrevCard = () => {
    if (opFeaturedCards.length > 0) {
      setOpCurrentCardIndex((prev) => 
        prev === 0 ? opFeaturedCards.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return <Loading message="Loading..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
      {/* Hero Section */}
      <Box sx={{ my: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <HoloLogo size={64} />
          <Typography variant="h2" component="h1" fontWeight={700}>
            Welcome to Holo
          </Typography>
        </Box>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, ml: 9 }}>
          Your TCG Market Analytics Platform
        </Typography>
        <Box sx={{ ml: 9, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/cards')}
          >
            Browse Pokemon Cards
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/onepiece/cards')}
            sx={{ 
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)',
              }
            }}
          >
            Browse One Piece Cards
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/analytics')}
          >
            View Analytics
          </Button>
        </Box>
      </Box>

      {/* Pokemon Market Ticker */}
      {marketOverview && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(129, 140, 248, 0.1) 100%)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: 'primary.main' }}>
            🎴 Pokemon TCG Market Data
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4,
              animation: 'ticker-scroll 30s linear infinite',
              whiteSpace: 'nowrap',
            }}
          >
            {[1, 2].map((iteration) => (
              <React.Fragment key={iteration}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Market Cap: {formatPrice(marketOverview.totalValue)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2">
                  Avg: {formatPrice(marketOverview.averagePrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2">
                  Median: {formatPrice(marketOverview.medianPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2" sx={{ color: 'primary.main' }}>
                  Top: {marketOverview.mostExpensive[0]?.name} ({formatPrice(marketOverview.mostExpensive[0]?.price)})
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2">
                  {marketOverview.totalCards.toLocaleString()} Cards
                </Typography>
                {iteration === 1 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>•</Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      )}

      {/* One Piece Market Ticker */}
      {opMarketOverview && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%)',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: 'error.main' }}>
            🏴‍☠️ One Piece TCG Market Data
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4,
              animation: 'ticker-scroll 30s linear infinite',
              whiteSpace: 'nowrap',
            }}
          >
            {[1, 2].map((iteration) => (
              <React.Fragment key={iteration}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: 'error.main', fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Market Cap: {formatPrice(opMarketOverview.totalValue)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2">
                  Avg: {formatPrice(opMarketOverview.averagePrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2">
                  Median: {formatPrice(opMarketOverview.medianPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2" sx={{ color: 'error.main' }}>
                  Top: {opMarketOverview.mostExpensive[0]?.card_name} ({formatPrice(opMarketOverview.mostExpensive[0]?.market_price)})
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2">
                  {opMarketOverview.totalCards.toLocaleString()} Cards
                </Typography>
                {iteration === 1 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>•</Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      )}

      {/* SIDE-BY-SIDE Featured Cards Section */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* Pokemon TCG Featured Cards */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: 0 } }}>
          {currentCard && (
            <Paper elevation={3} sx={{ p: 3, width: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(129, 140, 248, 0.1) 100%)', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  🎴 Pokemon TCG - Most Expensive
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/analytics')}
                >
                  View All
                </Button>
              </Box>
              
              <Box
                sx={{
                  width: '100%',
                  height: 450,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  mb: 2,
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
                onClick={() => navigate(`/cards/${currentCard.id}`)}
              >
                <Box
                  component="img"
                  src={currentCard.imageUrl}
                  alt={currentCard.name}
                  sx={{
                    width: '95%',
                    height: '95%',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              <Typography 
                variant="h5" 
                fontWeight={600} 
                sx={{ 
                  mb: 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
                onClick={() => navigate(`/cards/${currentCard.id}`)}
              >
                {truncateText(currentCard.name, 35)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentCard.setName}
              </Typography>
              <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                {formatPrice(currentCard.price)}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <IconButton onClick={handlePrevCard} size="small" sx={{ bgcolor: 'background.paper' }}>
                  <KeyboardArrowLeft />
                </IconButton>
                <IconButton onClick={handleNextCard} size="small" sx={{ bgcolor: 'background.paper' }}>
                  <KeyboardArrowRight />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                {featuredCards.map((card, index) => (
                  <Box
                    key={card.id}
                    onClick={() => setCurrentCardIndex(index)}
                    sx={{
                      minWidth: 70,
                      height: 100,
                      cursor: 'pointer',
                      opacity: index === currentCardIndex ? 1 : 0.5,
                      border: index === currentCardIndex ? '3px solid' : '2px solid',
                      borderColor: index === currentCardIndex ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        opacity: 1,
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={card.imageUrl}
                      alt={card.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        {/* One Piece TCG Featured Cards */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: 0 } }}>
          {opCurrentCard && (
            <Paper elevation={3} sx={{ p: 3, width: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%)', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  🏴‍☠️ One Piece TCG - Most Expensive
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/analytics')}
                >
                  View All
                </Button>
              </Box>
              
              <Box
                sx={{
                  width: '100%',
                  height: 450,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  mb: 2,
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
                onClick={() => navigate(`/onepiece/cards/${opCurrentCard.card_image_id || opCurrentCard.card_set_id}`)}
              >
                <Box
                  component="img"
                  src={opCurrentCard.card_image}
                  alt={opCurrentCard.card_name}
                  sx={{
                    width: '95%',
                    height: '95%',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              <Typography 
                variant="h5" 
                fontWeight={600} 
                sx={{ 
                  mb: 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'error.main',
                  }
                }}
                onClick={() => navigate(`/onepiece/cards/${opCurrentCard.card_image_id || opCurrentCard.card_set_id}`)}
              >
                {truncateText(opCurrentCard.card_name, 35)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {opCurrentCard.set_name} • {opCurrentCard.card_set_id}
              </Typography>
              <Typography variant="h4" color="error" sx={{ mb: 2 }}>
                {formatPrice(opCurrentCard.market_price)}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <IconButton onClick={handleOpPrevCard} size="small" sx={{ bgcolor: 'background.paper' }}>
                  <KeyboardArrowLeft />
                </IconButton>
                <IconButton onClick={handleOpNextCard} size="small" sx={{ bgcolor: 'background.paper' }}>
                  <KeyboardArrowRight />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                {opFeaturedCards.map((card, index) => (
                  <Box
                    key={card.card_set_id || index}
                    onClick={() => setOpCurrentCardIndex(index)}
                    sx={{
                      minWidth: 70,
                      height: 100,
                      cursor: 'pointer',
                      opacity: index === opCurrentCardIndex ? 1 : 0.5,
                      border: index === opCurrentCardIndex ? '3px solid' : '2px solid',
                      borderColor: index === opCurrentCardIndex ? 'error.main' : 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        opacity: 1,
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={card.card_image}
                      alt={card.card_name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Quick Stats Dashboard */}
      {stats && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Database Statistics
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Pokemon Cards
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.totalCards?.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    One Piece Cards
                  </Typography>
                  <Typography variant="h3" component="div">
                    3,034
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Price Records
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.totalPriceRecords?.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Feature Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 6, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 0 } }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <SearchIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Search Cards
              </Typography>
              <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                Browse and search thousands of TCG cards with filtering.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 0 } }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Track Prices
              </Typography>
              <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                Monitor card prices with detailed history and trends.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 0 } }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <AssessmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Market Analytics
              </Typography>
              <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                Get insights with comprehensive data visualizations.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Ticker animation */}
      <style>
        {`
          @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </Container>
  );
};

export default HomePage;
