// src/pages/AnalyticsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  Tabs,
  Tab,
  TablePagination,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [marketOverview, setMarketOverview] = useState(null);
  const [setAnalytics, setSetAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expensiveCardsPage, setExpensiveCardsPage] = useState(0);
  
  const cardsPerPage = 10;

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [overviewRes, setsRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/market-overview`),
        axios.get(`${API_URL}/analytics/sets?limit=10`),
      ]);

      setMarketOverview(overviewRes.data);
      setSetAnalytics(setsRes.data.sets);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  const formatLargeNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  if (loading) {
    return <Loading message="Loading analytics..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <ErrorMessage error={error} title="Failed to load analytics" />
      </Container>
    );
  }

  // Prepare price distribution data for pie chart
  const priceDistData = marketOverview?.priceDistribution
    ? [
        { name: 'Under $1', value: marketOverview.priceDistribution.under1 || 0 },
        { name: '$1-$5', value: marketOverview.priceDistribution['1to5'] || 0 },
        { name: '$5-$10', value: marketOverview.priceDistribution['5to10'] || 0 },
        { name: '$10-$25', value: marketOverview.priceDistribution['10to25'] || 0 },
        { name: '$25-$50', value: marketOverview.priceDistribution['25to50'] || 0 },
        { name: '$50-$100', value: marketOverview.priceDistribution['50to100'] || 0 },
        { name: 'Over $100', value: marketOverview.priceDistribution.over100 || 0 },
      ].filter(item => item.value > 0) // Remove empty categories
    : [];

  console.log('Price Distribution Data:', priceDistData); // Debug log

  // Prepare set comparison data
  const setComparisonData = setAnalytics.map((set) => ({
    name: set.name.length > 20 ? set.name.substring(0, 20) + '...' : set.name,
    avgPrice: parseFloat(set.averagePrice.toFixed(2)),
    totalValue: parseFloat(set.totalValue.toFixed(2)),
    cards: set.totalCards,
  }));

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Market Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive insights and statistics from the Pokemon TCG market
      </Typography>

      {/* Market Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {formatLargeNumber(marketOverview?.totalCards)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cards Tracked
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {formatPrice(marketOverview?.totalValue)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Market Value
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {formatPrice(marketOverview?.averagePrice)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Average Price
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {formatPrice(marketOverview?.medianPrice)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Median Price
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Price Distribution" />
          <Tab label="Most Expensive Cards" />
          <Tab label="Set Comparison" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: Price Distribution */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Price Distribution
              </Typography>
              {priceDistData.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                  No price distribution data available
                </Typography>
              ) : (
                <>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    {priceDistData.map((item, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {formatLargeNumber(item.value)}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {((item.value / marketOverview.totalCards) * 100).toFixed(1)}% of cards
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Key Insights
                    </Typography>
                    <Typography variant="body1" paragraph>
                      • <strong>{((priceDistData[0]?.value / marketOverview.totalCards) * 100).toFixed(1)}%</strong> of cards are valued under $1
                    </Typography>
                    <Typography variant="body1" paragraph>
                      • Only <strong>{formatLargeNumber(marketOverview.priceDistribution.over100)}</strong> cards ({((marketOverview.priceDistribution.over100 / marketOverview.totalCards) * 100).toFixed(1)}%) are worth over $100
                    </Typography>
                    <Typography variant="body1">
                      • The median price of <strong>${marketOverview.medianPrice}</strong> shows most cards are affordable for collectors
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
          )}

          {/* Tab 1: Most Expensive Cards */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Most Expensive Cards
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Showing top 50 most valuable cards in the database
              </Typography>
              
              <Grid container spacing={3}>
                {marketOverview?.mostExpensive
                  ?.slice(expensiveCardsPage * cardsPerPage, (expensiveCardsPage + 1) * cardsPerPage)
                  .map((card, index) => {
                    const rank = expensiveCardsPage * cardsPerPage + index + 1;
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 6,
                            },
                            transition: 'all 0.3s ease',
                          }}
                          onClick={() => navigate(`/cards/${card.id}`)}
                        >
                          <Box sx={{ position: 'relative' }}>
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
                                fontWeight: 'bold',
                                zIndex: 1,
                              }}
                            >
                              {rank}
                            </Box>
                            <CardMedia
                              component="img"
                              image={card.imageUrl}
                              alt={card.name}
                              sx={{ height: 342, objectFit: 'contain', bgcolor: '#f5f5f5' }}
                            />
                          </Box>
                          <CardContent>
                            <Typography variant="h6" noWrap>
                              {card.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {card.setName}
                            </Typography>
                            <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                              {formatPrice(card.price)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
              </Grid>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <TablePagination
                  component="div"
                  count={marketOverview?.mostExpensive?.length || 0}
                  page={expensiveCardsPage}
                  onPageChange={(e, newPage) => setExpensiveCardsPage(newPage)}
                  rowsPerPage={cardsPerPage}
                  rowsPerPageOptions={[10]}
                  labelDisplayedRows={({ from, to, count }) => 
                    `Showing ${from}-${to} of top ${count} cards`
                  }
                />
              </Box>
            </Box>
          )}

          {/* Tab 2: Set Comparison */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Set Value Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={setComparisonData} margin={{ bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value) => formatPrice(value)} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="avgPrice"
                    fill="#1976d2"
                    name="Average Card Price"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="totalValue"
                    fill="#82ca9d"
                    name="Total Set Value"
                  />
                </BarChart>
              </ResponsiveContainer>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Set Details
                </Typography>
                <Grid container spacing={2}>
                  {setAnalytics.map((set) => (
                    <Grid item xs={12} md={6} key={set.id}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {set.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {set.series} • Released:{' '}
                          {new Date(set.releaseDate).toLocaleDateString()}
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Cards
                            </Typography>
                            <Typography variant="body1">{set.totalCards}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Avg Price
                            </Typography>
                            <Typography variant="body1">
                              {formatPrice(set.averagePrice)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Total Value
                            </Typography>
                            <Typography variant="body1">
                              {formatPrice(set.totalValue)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Most Expensive
                            </Typography>
                            <Typography variant="body1">
                              {formatPrice(set.maxPrice)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;