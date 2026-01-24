// src/pages/CollectionDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  fetchCollectionById,
  addCardToCollection,
  removeCardFromCollection,
} from '../store/slices/collectionSlice';
import { searchCards } from '../store/slices/cardsSlice';
import Loading from '../components/common/Loading';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCollection, loading } = useSelector((state) => state.collections);
  const { searchResults } = useSelector((state) => state.cards);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState('');

  useEffect(() => {
    dispatch(fetchCollectionById(id));
  }, [dispatch, id]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      dispatch(searchCards(query));
    }
  };

  const handleSelectCard = (card) => {
    setSelectedCard(card);
    setAddDialogOpen(true);
  };

  const handleAddCard = async () => {
    if (selectedCard) {
      await dispatch(
        addCardToCollection({
          collectionId: id,
          cardData: {
            cardId: selectedCard.id,
            quantity: parseInt(quantity) || 1,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
          },
        })
      );
      // Refresh collection
      dispatch(fetchCollectionById(id));
      setAddDialogOpen(false);
      setSelectedCard(null);
      setQuantity(1);
      setPurchasePrice('');
      setSearchQuery('');
    }
  };

  const handleRemoveCard = async (itemId) => {
    if (window.confirm('Remove this card from your collection?')) {
      await dispatch(removeCardFromCollection({ collectionId: id, itemId }));
      dispatch(fetchCollectionById(id));
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  if (loading && !selectedCollection) {
    return <Loading message="Loading collection..." />;
  }

  if (!selectedCollection) {
    return (
      <Container maxWidth="lg">
        <Typography>Collection not found</Typography>
      </Container>
    );
  }

  const totalValue = selectedCollection.stats?.totalValue || 0;
  const totalCost = selectedCollection.stats?.totalCost || 0;
  const roi = selectedCollection.stats?.roi || 0;

  return (
    <Container maxWidth="lg">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/collections')}
        sx={{ mb: 3 }}
      >
        Back to Collections
      </Button>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
              {selectedCollection.name}
            </Typography>
            {selectedCollection.description && (
              <Typography variant="body1" color="text.secondary">
                {selectedCollection.description}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Cards
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4">{selectedCollection.stats?.totalCards || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Total Cards</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">{formatPrice(totalValue)}</Typography>
              <Typography variant="body2" color="text.secondary">Current Value</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4">{formatPrice(totalCost)}</Typography>
              <Typography variant="body2" color="text.secondary">Total Cost</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{ color: roi >= 0 ? 'success.main' : 'error.main' }}
              >
                {roi.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">ROI</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Cards in Collection */}
      {selectedCollection.items?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No cards in this collection yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start adding cards to track their value and build your collection
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Your First Card
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {selectedCollection.items?.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <Card>
                <CardMedia
                  component="img"
                  image={item.card.imageUrl}
                  alt={item.card.name}
                  sx={{ height: 300, objectFit: 'contain', bgcolor: '#f5f5f5' }}
                />
                <CardContent>
                  <Typography variant="h6" noWrap gutterBottom>
                    {item.card.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.card.setName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                    <Chip label={`Qty: ${item.quantity}`} size="small" />
                    <Chip label={item.condition} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Current</Typography>
                      <Typography variant="body1" color="primary.main">
                        {formatPrice(item.card.priceHistory[0]?.marketPrice)}
                      </Typography>
                    </Box>
                    {item.purchasePrice && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">Paid</Typography>
                        <Typography variant="body1">
                          {formatPrice(item.purchasePrice)}
                        </Typography>
                      </Box>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveCard(item.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Card Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Card to Collection</DialogTitle>
        <DialogContent>
          {!selectedCard ? (
            <>
              <TextField
                fullWidth
                placeholder="Search for a card..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Grid container spacing={2}>
                {searchResults.map((card) => (
                  <Grid item xs={6} sm={4} md={3} key={card.id}>
                    <Card
                      onClick={() => handleSelectCard(card)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 },
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={card.imageUrl}
                        alt={card.name}
                        sx={{ height: 200, objectFit: 'contain' }}
                      />
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="body2" noWrap>
                          {card.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box
                  component="img"
                  src={selectedCard.imageUrl}
                  alt={selectedCard.name}
                  sx={{ width: 150, height: 'auto' }}
                />
                <Box>
                  <Typography variant="h6">{selectedCard.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCard.setName}
                  </Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                fullWidth
                label="Purchase Price (optional)"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Enter how much you paid for this card"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialogOpen(false);
            setSelectedCard(null);
            setSearchQuery('');
          }}>
            Cancel
          </Button>
          {selectedCard && (
            <Button onClick={handleAddCard} variant="contained">
              Add to Collection
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CollectionDetailPage;