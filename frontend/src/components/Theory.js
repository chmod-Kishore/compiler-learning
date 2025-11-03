// src/components/Theory.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { getTheory } from '../services/api';

function Theory({ topic = 'syntax' }) {
  const [theory, setTheory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTheory = async () => {
      try {
        setLoading(true);
        const data = await getTheory(topic);
        setTheory(data);
      } catch (err) {
        console.error('Error loading theory:', err);
        setError('Failed to load theory content');
      } finally {
        setLoading(false);
      }
    };

    loadTheory();
  }, [topic]);

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
            '& h4': { mt: 2, mb: 1, fontWeight: 600 },
            '& ul': { pl: 3 },
            '& ol': { pl: 3 },
            '& pre': { 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.9rem',
              lineHeight: 1.6
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              my: 2,
              fontSize: '0.9rem'
            },
            '& th': {
              backgroundColor: '#f5f5f5',
              fontWeight: 600,
              textAlign: 'left',
              p: 1.5
            },
            '& td': {
              p: 1.5,
              borderBottom: '1px solid #e0e0e0'
            },
            '& hr': {
              my: 4,
              border: 'none',
              borderTop: '2px solid #e0e0e0'
            },
            '& p': {
              lineHeight: 1.8,
              mb: 2
            },
            '& strong': {
              color: 'primary.main',
              fontWeight: 600
            }
          }}
        />
      </CardContent>
    </Card>
  );
}

export default Theory;