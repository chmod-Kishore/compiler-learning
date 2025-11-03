import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import SubsectionTheory from './SubsectionTheory';

function LexicalAnalysis() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={600}>
                Lexical Analysis
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Phase 1: RE → ε-NFA → NFA → DFA → Min DFA
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content - Full Width */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            bgcolor: 'white',
          }}
        >
          <SubsectionTheory />
        </Paper>
      </Container>
    </Box>
  );
}

export default LexicalAnalysis;
