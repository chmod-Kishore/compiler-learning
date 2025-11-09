// src/components/SemanticTheory.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress,
  Alert
} from '@mui/material';
import { getSemanticTheory } from '../services/api';

function SemanticTheory({ subsectionId }) {
  const [theoryContent, setTheoryContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map subsection IDs to topic keys
  const getTopicKey = (subsectionId) => {
    const mapping = {
      '3.1': 'type-checking',
      '3.2': 'sdt',
      '3.3': 'attributes',
      '3.4': 'symbol-table',
      '3.5': 'semantic-actions'
    };
    return mapping[subsectionId] || 'type-checking';
  };

  useEffect(() => {
    const fetchTheory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const topic = getTopicKey(subsectionId);
        const content = await getSemanticTheory(topic);
        setTheoryContent(content);
      } catch (err) {
        console.error('Error fetching theory:', err);
        setError('Failed to load theory content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTheory();
  }, [subsectionId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#00acc1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <div 
          dangerouslySetInnerHTML={{ __html: theoryContent }}
          style={{
            lineHeight: '1.8',
            fontSize: '1rem'
          }}
        />
      </Paper>
    </Box>
  );
}

export default SemanticTheory;