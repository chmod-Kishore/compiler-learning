// src/components/Theory.js
import React, { useState, useEffect } from 'react';
import { CardContent, Typography, CircularProgress, Box, Paper } from '@mui/material';
import { MenuBook } from '@mui/icons-material';
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
    <Paper 
      elevation={3} 
      sx={{ 
        mt: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e3f2fd'
      }}
    >
      {/* Header with gradient */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
          borderBottom: '3px solid #5e35b1'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MenuBook sx={{ fontSize: 36, color: 'white' }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {theory?.title}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 4, bgcolor: '#fafafa' }}>
        <Box 
          dangerouslySetInnerHTML={{ __html: theory?.content }}
          sx={{
            '& h2': { 
              mt: 4, 
              mb: 2.5, 
              color: '#667eea',
              fontWeight: 700,
              fontSize: '1.75rem',
              borderBottom: '2px solid #e3f2fd',
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:before': {
                content: '"📘"',
                fontSize: '1.5rem'
              }
            },
            '& h3': { 
              mt: 3, 
              mb: 1.5, 
              color: '#764ba2',
              fontWeight: 600,
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:before': {
                content: '"▶"',
                color: '#667eea',
                fontSize: '1rem'
              }
            },
            '& h4': { 
              mt: 2.5, 
              mb: 1, 
              fontWeight: 600,
              color: '#5e35b1',
              fontSize: '1.15rem'
            },
            '& ul': { 
              pl: 3,
              my: 2,
              '& li': {
                mb: 1,
                lineHeight: 1.8,
                '&:before': {
                  content: '"•"',
                  color: '#667eea',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  width: '1em',
                  marginLeft: '-1em'
                }
              }
            },
            '& ol': { 
              pl: 3,
              my: 2,
              '& li': {
                mb: 1,
                lineHeight: 1.8
              }
            },
            '& pre': { 
              backgroundColor: '#ffffff',
              border: '2px solid #e3f2fd',
              p: 2.5, 
              borderRadius: 2,
              overflow: 'auto',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              my: 2.5
            },
            '& code': {
              backgroundColor: '#f3e5f5',
              color: '#6a1b9a',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
              fontSize: '0.9em'
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              my: 3,
              fontSize: '0.9rem',
              backgroundColor: '#ffffff',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            },
            '& th': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 700,
              textAlign: 'left',
              p: 2,
              borderBottom: '3px solid #5e35b1'
            },
            '& td': {
              p: 2,
              borderBottom: '1px solid #e0e0e0'
            },
            '& tr:hover': {
              backgroundColor: '#f5f5f5'
            },
            '& hr': {
              my: 4,
              border: 'none',
              borderTop: '2px solid #e3f2fd'
            },
            '& p': {
              lineHeight: 1.9,
              mb: 2,
              color: '#424242',
              fontSize: '1rem'
            },
            '& strong': {
              color: '#667eea',
              fontWeight: 700
            },
            '& em': {
              color: '#764ba2',
              fontStyle: 'italic'
            },
            '& blockquote': {
              borderLeft: '4px solid #667eea',
              pl: 2,
              ml: 0,
              my: 2,
              py: 1,
              backgroundColor: '#f3e5f5',
              borderRadius: '0 4px 4px 0',
              fontStyle: 'italic',
              color: '#5e35b1'
            }
          }}
        />
      </CardContent>
    </Paper>
  );
}

export default Theory;