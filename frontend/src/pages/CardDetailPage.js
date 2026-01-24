// src/pages/CardDetailPage.js
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fetchCardById } from '../store/slices/cardsSlice';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const CardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCard, loading, error } = useSelector((state) => state.cards);

  useEffect(() => {
    dispatch(fetchCardById(id));
  }, [dispatch, id]);

  if (loading) {
    return <Loading message="Loading card details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <ErrorMessage error={error} title="Failed to load card" />
        <Button onClick={() => navigate('/cards')} startIcon={<ArrowBackIcon />}>
          Back to Cards
        </Button>
      </Container>
    );
  }

  if (!selectedCard) {
    return null;
  }

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  // Prepare chart data
  const chartData = selectedCard.priceHistory?.map((record) => ({
    date: format(new Date(record.date), 'MMM dd'),
    price: record.marketPrice,
    low: record.lowPrice,
    high: record.highPrice,
  })) || [];

  const latestPrice = selectedCard.priceHistory?.[0];

  return (
    <Container maxWidth="lg">
      <Button
        onClick={() => navigate('/cards')}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Cards
      </Button>

      <Grid container spacing={4}>
        {/* Card Image & Basic Info */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box
              component="img"
              src={selectedCard.imageUrlHiRes || selectedCard.imageUrl}
              alt={selectedCard.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                mb: 2,
              }}
            />
            <Typography variant="h4" gutterBottom fontWeight={600}>
              {selectedCard.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {selectedCard.setName} • #{selectedCard.number}
            </Typography>

            {latestPrice && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                  {formatPrice(latestPrice.marketPrice)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Market Price (as of {format(new Date(latestPrice.date), 'MMM dd, yyyy')})
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Card Details & Price Chart */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Card Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Supertype
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedCard.supertype}
                </Typography>
              </Grid>
              {selectedCard.hp && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    HP
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedCard.hp}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Rarity
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedCard.rarity || 'Unknown'}
                </Typography>
              </Grid>
              {selectedCard.artist && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Artist
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedCard.artist}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {selectedCard.types && selectedCard.types.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Types
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedCard.types.map((type) => (
                    <Chip key={type} label={type} />
                  ))}
                </Box>
              </Box>
            )}

            {selectedCard.subtypes && selectedCard.subtypes.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Subtypes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedCard.subtypes.map((subtype) => (
                    <Chip key={subtype} label={subtype} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          {chartData.length > 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Price History
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value?.toFixed(2)}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Market Price"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="#4caf50"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Low"
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#f44336"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="High"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CardDetailPage;