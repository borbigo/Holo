// src/components/common/ErrorMessage.js
import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

const ErrorMessage = ({ error, title = 'Error' }) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity="error">
        <AlertTitle>{title}</AlertTitle>
        {error || 'Something went wrong. Please try again.'}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;