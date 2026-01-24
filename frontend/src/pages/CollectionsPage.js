// src/pages/CollectionsPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchCollections, createCollection, deleteCollection } from '../store/slices/collectionSlice';
import Loading from '../components/common/Loading';

const CollectionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { collections, loading } = useSelector((state) => state.collections);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      await dispatch(createCollection({
        name: newCollectionName,
        description: newCollectionDescription,
      }));
      setNewCollectionName('');
      setNewCollectionDescription('');
      setCreateDialogOpen(false);
    }
  };

  const handleDeleteCollection = async (collectionId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this collection?')) {
      await dispatch(deleteCollection(collectionId));
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  if (loading && collections.length === 0) {
    return <Loading message="Loading collections..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          My Collections
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Collection
        </Button>
      </Box>

      {collections.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have any collections yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first collection to start tracking your Pokemon cards
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Collection
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {collections.map((collection) => (
            <Grid item xs={12} sm={6} md={4} key={collection.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" component="h2" fontWeight={600}>
                      {collection.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteCollection(collection.id, e)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  {collection.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {collection.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Cards
                      </Typography>
                      <Typography variant="h6">
                        {collection.stats?.totalCards || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Value
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatPrice(collection.stats?.totalValue || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ROI
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: (collection.stats?.roi || 0) >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {(collection.stats?.roi || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Collection Name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={newCollectionDescription}
            onChange={(e) => setNewCollectionDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained" disabled={!newCollectionName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CollectionsPage;