// frontend/src/components/common/Navbar.js

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Style as CardIcon,
  Analytics as AnalyticsIcon,
  Collections as CollectionsIcon,
} from '@mui/icons-material';
import HoloLogo from './HoloLogo';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const isAuthenticated = auth?.isAuthenticated || false;
  const user = auth?.user || null;
  const [anchorEl, setAnchorEl] = useState(null);
  const [cardsMenuAnchor, setCardsMenuAnchor] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCardsMenuOpen = (event) => {
    setCardsMenuAnchor(event.currentTarget);
  };

  const handleCardsMenuClose = () => {
    setCardsMenuAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/');
  };

  const handleCollections = () => {
    handleClose();
    navigate('/collections');
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #111827 0%, #0A0E1A 100%)',
        borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '70px' }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              mr: 4,
            }}
          >
            <HoloLogo size={36} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
              }}
            >
              Holo
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ 
                color: 'white',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'rgba(96, 165, 250, 0.1)',
                }
              }}
              startIcon={<HomeIcon />}
            >
              Home
            </Button>
            
            {/* Cards Dropdown */}
            <Button
              onClick={handleCardsMenuOpen}
              sx={{ 
                color: 'white',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'rgba(96, 165, 250, 0.1)',
                }
              }}
              startIcon={<CardIcon />}
            >
              Cards
            </Button>
            <Menu
              anchorEl={cardsMenuAnchor}
              open={Boolean(cardsMenuAnchor)}
              onClose={handleCardsMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem 
                onClick={() => {
                  handleCardsMenuClose();
                  navigate('/cards');
                }}
              >
                Pokemon TCG
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleCardsMenuClose();
                  navigate('/onepiece/cards');
                }}
              >
                One Piece TCG
              </MenuItem>
            </Menu>

            <Button
              component={RouterLink}
              to="/analytics"
              sx={{ 
                color: 'white',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'rgba(96, 165, 250, 0.1)',
                }
              }}
              startIcon={<AnalyticsIcon />}
            >
              Analytics
            </Button>
            {isAuthenticated && (
              <Button
                component={RouterLink}
                to="/collections"
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'rgba(96, 165, 250, 0.1)',
                  }
                }}
                startIcon={<CollectionsIcon />}
              >
                Collections
              </Button>
            )}
          </Box>

          {/* Auth Section */}
          {isAuthenticated ? (
            <Box>
              <IconButton
                size="large"
                onClick={handleMenu}
                sx={{ color: 'white' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleCollections}>
                  <CollectionsIcon sx={{ mr: 1 }} /> My Collections
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                sx={{ color: 'white' }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
