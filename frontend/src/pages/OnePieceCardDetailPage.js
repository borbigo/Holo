// frontend/src/pages/OnePieceCardDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Loading from '../components/common/Loading';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const OnePieceCardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCard();
  }, [id]);

  const fetchCard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all cards and find the one with matching ID
      const response = await axios.get(`${API_URL}/onepiece/cards`);
      
      // First try to find by card_image_id (more specific for variants)
      let foundCard = response.data.find(c => c.card_image_id === id);
      
      // If not found, try card_set_id
      if (!foundCard) {
        foundCard = response.data.find(c => c.card_set_id === id);
      }
      
      // If still not found, try generic id
      if (!foundCard) {
        foundCard = response.data.find(c => c.id === id);
      }
      
      if (foundCard) {
        setCard(foundCard);
      } else {
        setError('Card not found');
      }
    } catch (err) {
      console.error('Error fetching card:', err);
      setError('Failed to load card details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return <Loading message="Loading card details..." />;
  }

  if (error || !card) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Card not found'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/onepiece/cards')}
            sx={{ mt: 2 }}
          >
            Back to Cards
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/onepiece/cards')}
        sx={{ mb: 3 }}
      >
        Back to Cards
      </Button>

      <Grid container spacing={4}>
        {/* Card Image */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%)',
              border: '1px solid rgba(231, 76, 60, 0.2)',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 500,
              }}
            >
              <Box
                component="img"
                src={card.card_image || 'https://via.placeholder.com/245x342?text=No+Image'}
                alt={card.card_name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 600,
                  objectFit: 'contain',
                  borderRadius: 2,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Card Details */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              {card.card_name || 'Unknown Card'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {card.card_color && (
                <Chip 
                  label={card.card_color} 
                  color="error" 
                  size="small" 
                />
              )}
              {card.card_type && (
                <Chip 
                  label={card.card_type} 
                  variant="outlined" 
                  size="small" 
                />
              )}
              {card.card_rarity && (
                <Chip 
                  label={card.card_rarity} 
                  variant="outlined" 
                  size="small" 
                />
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Card ID
                    </Typography>
                    <Typography variant="h6">
                      {card.card_set_id || card.card_image_id || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Market Price
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatPrice(card.market_price)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      Set
                    </Typography>
                    <Typography variant="body1">
                      {card.set_name || 'Unknown Set'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {card.card_cost && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        Cost
                      </Typography>
                      <Typography variant="body1">
                        {card.card_cost}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {card.card_power && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        Power
                      </Typography>
                      <Typography variant="body1">
                        {card.card_power}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {card.card_counter && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        Counter
                      </Typography>
                      <Typography variant="body1">
                        {card.card_counter}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {card.card_effect && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Card Effect
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {card.card_effect}
                  </Typography>
                </Paper>
              </>
            )}

            {card.card_trigger && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Trigger Effect
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {card.card_trigger}
                  </Typography>
                </Paper>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OnePieceCardDetailPage;
