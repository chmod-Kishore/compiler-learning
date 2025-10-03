// src/components/Theory.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { getTheory } from '../services/api';

function Theory() {
  const [theory, setTheory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTheory();
  }, []);

  const loadTheory = async () => {
    try {
      const data = await getTheory();
      setTheory(data);
    } catch (err) {
      console.error('Error loading theory:', err);
      setError('Failed to load theory content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {theory?.title}
        </Typography>
        <Box 
          dangerouslySetInnerHTML={{ __html: theory?.content }}
          sx={{
            '& h2': { mt: 3, mb: 2, color: 'primary.main' },
            '& h3': { mt: 2, mb: 1, color: 'text.secondary' },
            '& ul': { pl: 3 },
            '& ol': { pl: 3 },
            '& pre': { 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto'
            }
          }}
        />
      </CardContent>
    </Card>
  );
}

export default Theory;