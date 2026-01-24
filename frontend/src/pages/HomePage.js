// src/pages/HomePage.js
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
  CardMedia,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
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
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const featuredCards = marketOverview?.mostExpensive?.slice(0, 8) || [];
  const currentCard = featuredCards[currentCardIndex];

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-rotate carousel every 8 seconds
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

  const fetchData = async () => {
    try {
      const [statsRes, marketRes] = await Promise.all([
        axios.get(`${API_URL}/cards/stats`),
        axios.get(`${API_URL}/analytics/market-overview`),
      ]);
      setStats(statsRes.data);
      setMarketOverview(marketRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    if (marketOverview?.mostExpensive) {
      setCurrentCardIndex((prev) => 
        prev === Math.min(4, marketOverview.mostExpensive.length - 1) ? 0 : prev + 1
      );
    }
  };

  const handlePrevCard = () => {
    if (marketOverview?.mostExpensive) {
      setCurrentCardIndex((prev) => 
        prev === 0 ? Math.min(4, marketOverview.mostExpensive.length - 1) : prev - 1
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
    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
      {/* Hero Section */}
      <Box sx={{ my: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <HoloLogo size={64} />
          <Typography variant="h2" component="h1" fontWeight={700}>
            Welcome to Holo
          </Typography>
        </Box>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, ml: 9 }}>
          Your Pokemon TCG Market Analytics Platform
        </Typography>
        <Box sx={{ ml: 9 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/cards')}
            sx={{ mr: 2 }}
          >
            Browse Cards
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

      {/* Market Ticker - Continuous Scroll */}
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
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4,
              animation: 'ticker-scroll 30s linear infinite',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Duplicate the content for seamless loop */}
            {[1, 2].map((iteration) => (
              <React.Fragment key={iteration}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body1" fontWeight={600}>
                    Market Cap: {formatPrice(marketOverview.totalValue)}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    Avg Price: {formatPrice(marketOverview.averagePrice)}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    Median: {formatPrice(marketOverview.medianPrice)}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ color: 'primary.main' }}>
                    Most Expensive: {marketOverview.mostExpensive[0]?.name} - {formatPrice(marketOverview.mostExpensive[0]?.price)}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    {marketOverview.totalCards.toLocaleString()} Cards Tracked
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    Top Set: {marketOverview.mostExpensive[0]?.setName}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    Highest Price: {formatPrice(marketOverview.maxPrice)}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    Lowest Price: {formatPrice(marketOverview.minPrice)}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    Cards over $100: {marketOverview.priceDistribution?.over100 || 0}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">•</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">
                    Budget Cards (&lt;$1): {marketOverview.priceDistribution?.under1 || 0}
                  </Typography>
                </Box>

                {iteration === 1 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>•</Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      )}

      {/* Add ticker animation to index.css */}
      <style>
        {`
          @keyframes ticker-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>

      {/* Featured Card Showcase */}
      {currentCard && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(10, 14, 26, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(96, 165, 250, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={600}>
              Featured Cards
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/analytics')}
            >
              View All
            </Button>
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={currentCard.imageUrl}
                  alt={currentCard.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(96, 165, 250, 0.3)',
                  }}
                />
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <Paper sx={{ px: 2, py: 1, bgcolor: 'rgba(0,0,0,0.7)' }}>
                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                      {formatPrice(currentCard.price)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box sx={{ pl: { md: 4 } }}>
                <Typography variant="h3" gutterBottom fontWeight={700}>
                  {currentCard.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {currentCard.setName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Ranked #{currentCardIndex + 1} in most expensive cards
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <IconButton 
                    onClick={handlePrevCard}
                    sx={{ 
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.1)' }
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton 
                    onClick={handleNextCard}
                    sx={{ 
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.1)' }
                    }}
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/cards/${currentCard.id}`)}
                >
                  View Card Details
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Thumbnail Preview */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            {featuredCards.map((card, index) => (
              <Box
                key={card.id}
                onClick={() => setCurrentCardIndex(index)}
                sx={{
                  width: 60,
                  height: 84,
                  cursor: 'pointer',
                  opacity: index === currentCardIndex ? 1 : 0.5,
                  border: index === currentCardIndex ? '2px solid' : '1px solid',
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
                    Total Cards
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
                    Total Sets
                  </Typography>
                  <Typography variant="h3" component="div">
                    {stats.totalSets}
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
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <SearchIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Search Cards
              </Typography>
              <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                Browse and search thousands of Pokemon cards with filtering.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
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
        </Grid>
        <Grid item xs={12} md={4}>
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
        </Grid>
      </Grid>
      </Container>
  );
};

export default HomePage;