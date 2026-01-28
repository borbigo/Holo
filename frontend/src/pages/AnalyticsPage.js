// frontend/src/pages/AnalyticsPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  Pagination,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import Loading from '../components/common/Loading';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  
  const [marketOverview, setMarketOverview] = useState(null);
  const [setAnalytics, setSetAnalytics] = useState(null);
  const [onePieceCards, setOnePieceCards] = useState([]);
  const [opMarketOverview, setOpMarketOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tcgTab, setTcgTab] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [expensiveCardsPage, setExpensiveCardsPage] = useState(0);
  const cardsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [marketRes, setRes, onePieceRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/market-overview`),
        axios.get(`${API_URL}/analytics/sets`),
        axios.get(`${API_URL}/onepiece/cards`),
      ]);

      setMarketOverview(marketRes.data);
      setSetAnalytics(setRes.data);
      
      const sortedOnePiece = onePieceRes.data
        .filter(card => card.market_price)
        .sort((a, b) => b.market_price - a.market_price);
      setOnePieceCards(sortedOnePiece);
      
      const prices = sortedOnePiece.map(c => c.market_price);
      const total = prices.reduce((sum, p) => sum + p, 0);
      const avg = total / prices.length;
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const median = sortedPrices[Math.floor(sortedPrices.length / 2)];
      
      setOpMarketOverview({
        totalCards: sortedOnePiece.length,
        totalValue: total,
        averagePrice: avg,
        medianPrice: median,
        maxPrice: Math.max(...prices),
        minPrice: Math.min(...prices),
        mostExpensive: sortedOnePiece.slice(0, 50),
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`;
    return `$${price.toFixed(2)}`;
  };

  const formatLargeNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getPriceDistData = (overview) => {
    if (!overview?.priceDistribution) return [];
    
    const dist = overview.priceDistribution;
    return [
      { range: 'Under $1', count: dist.under1 || 0 },
      { range: '$1-5', count: dist['1to5'] || 0 },
      { range: '$5-10', count: dist['5to10'] || 0 },
      { range: '$10-25', count: dist['10to25'] || 0 },
      { range: '$25-50', count: dist['25to50'] || 0 },
      { range: '$50-100', count: dist['50to100'] || 0 },
      { range: '$100+', count: dist.over100 || 0 },
    ];
  };

  const getOpPriceDistData = () => {
    const ranges = { under1: 0, '1to5': 0, '5to10': 0, '10to25': 0, '25to50': 0, '50to100': 0, over100: 0 };
    onePieceCards.forEach(card => {
      const price = card.market_price;
      if (price < 1) ranges.under1++;
      else if (price < 5) ranges['1to5']++;
      else if (price < 10) ranges['5to10']++;
      else if (price < 25) ranges['10to25']++;
      else if (price < 50) ranges['25to50']++;
      else if (price < 100) ranges['50to100']++;
      else ranges.over100++;
    });

    return [
      { range: 'Under $1', count: ranges.under1 },
      { range: '$1-5', count: ranges['1to5'] },
      { range: '$5-10', count: ranges['5to10'] },
      { range: '$10-25', count: ranges['10to25'] },
      { range: '$25-50', count: ranges['25to50'] },
      { range: '$50-100', count: ranges['50to100'] },
      { range: '$100+', count: ranges.over100 },
    ];
  };

  const getSetComparisonData = () => {
    if (!setAnalytics?.sets) return [];
    
    return setAnalytics.sets.slice(0, 10).map(set => ({
      name: set.name.length > 20 ? set.name.substring(0, 20) + '...' : set.name,
      avgPrice: parseFloat(set.averagePrice.toFixed(2)),
      totalValue: parseFloat(set.totalValue.toFixed(2)),
      cards: set.totalCards,
    }));
  };

  if (loading) {
    return <Loading message="Loading analytics..." />;
  }

  const currentOverview = tcgTab === 0 ? marketOverview : opMarketOverview;
  const priceDistData = tcgTab === 0 ? getPriceDistData(marketOverview) : getOpPriceDistData();
  const setCompData = tcgTab === 0 ? getSetComparisonData() : [];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Market Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive insights and statistics from TCG markets
      </Typography>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs value={tcgTab} onChange={(e, v) => { setTcgTab(v); setActiveTab(0); setExpensiveCardsPage(0); }}>
          <Tab label="Pokemon TCG" />
          <Tab label="One Piece TCG" />
        </Tabs>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {formatLargeNumber(currentOverview?.totalCards)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cards Tracked
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {formatPrice(currentOverview?.totalValue)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Market Value
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {formatPrice(currentOverview?.averagePrice)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Average Price
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {formatPrice(currentOverview?.medianPrice)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Median Price
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Price Distribution" />
          <Tab label="Most Expensive Cards" />
          {tcgTab === 0 && <Tab label="Set Comparison" />}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Price Distribution
              </Typography>
              {priceDistData.length === 0 ? (
                <Typography>No price distribution data available</Typography>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={priceDistData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill={tcgTab === 0 ? "#60A5FA" : "#e74c3c"} name="Number of Cards" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Paper elevation={0} sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" color="text.secondary">
                      💡 <strong>Insight:</strong> The distribution shows most cards are affordable for collectors
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Most Expensive Cards
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Showing top 50 most valuable cards
              </Typography>
              
              <Grid container spacing={3}>
                {currentOverview?.mostExpensive
                  ?.slice(expensiveCardsPage * cardsPerPage, (expensiveCardsPage + 1) * cardsPerPage)
                  .map((card, index) => {
                    const rank = expensiveCardsPage * cardsPerPage + index + 1;
                    const isPokemon = tcgTab === 0;
                    const cardId = isPokemon ? card.id : (card.card_set_id || card.card_image_id);
                    const cardImage = isPokemon ? card.imageUrl : card.card_image;
                    const cardName = isPokemon ? card.name : card.card_name;
                    const cardSet = isPokemon ? card.setName : card.set_name;
                    const cardPrice = isPokemon ? card.price : card.market_price;
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={2.4} key={cardId || index}>
                        <Card
                          sx={{
                            height: 480, // FIXED: Uniform height
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 6,
                            },
                            transition: 'all 0.3s ease',
                          }}
                          onClick={() => isPokemon && navigate(`/cards/${cardId}`)}
                        >
                          <Box sx={{ position: 'relative', height: 320, flexShrink: 0 }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                bgcolor: 'primary.main',
                                color: 'white',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                zIndex: 1,
                              }}
                            >
                              #{rank}
                            </Box>
                            <CardMedia
                              component="img"
                              image={cardImage || 'https://via.placeholder.com/245x342'}
                              alt={cardName}
                              sx={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain', 
                                bgcolor: '#f5f5f5',
                                p: 1,
                              }}
                            />
                          </Box>
                          <CardContent sx={{ flexGrow: 1, overflow: 'hidden', p: 2 }}>
                            <Typography 
                              variant="h6" 
                              noWrap 
                              gutterBottom
                              sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}
                            >
                              {cardName}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              noWrap 
                              gutterBottom
                              sx={{ fontSize: '0.75rem' }}
                            >
                              {cardSet}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              color="primary" 
                              sx={{ mt: 1, fontSize: '1rem', fontWeight: 600 }}
                            >
                              {formatPrice(cardPrice)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
              </Grid>

              {currentOverview?.mostExpensive && currentOverview.mostExpensive.length > cardsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={Math.ceil(currentOverview.mostExpensive.length / cardsPerPage)}
                    page={expensiveCardsPage + 1}
                    onChange={(e, page) => setExpensiveCardsPage(page - 1)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </Box>
          )}

          {activeTab === 2 && tcgTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Set Comparison
              </Typography>
              {setCompData.length === 0 ? (
                <Typography>No set data available</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={setCompData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgPrice" fill="#60A5FA" name="Avg Price ($)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;
