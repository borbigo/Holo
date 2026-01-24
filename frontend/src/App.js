// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme/theme';

// Components
import Navbar from './components/common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import CardsPage from './pages/CardsPage';
import CardDetailPage from './pages/CardDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            background: `
              radial-gradient(ellipse at top left, rgba(96, 165, 250, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at top right, rgba(129, 140, 248, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(96, 165, 250, 0.1) 0%, transparent 60%),
              linear-gradient(180deg, #0A0E1A 0%, #050810 100%)
            `,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 50%, rgba(96, 165, 250, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(129, 140, 248, 0.03) 0%, transparent 50%)
              `,
              pointerEvents: 'none',
              animation: 'pulse 8s ease-in-out infinite',
              zIndex: 0,
            },
          }}
        >
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, py: 3, position: 'relative', zIndex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cards" element={<CardsPage />} />
              <Route path="/cards/:id" element={<CardDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:id" element={<CollectionDetailPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>

      {/* Global animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </ThemeProvider>
  );
}

export default App;