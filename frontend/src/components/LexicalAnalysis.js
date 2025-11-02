import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { ArrowBack, Code } from '@mui/icons-material';

const topics = [
  {
    title: 'Regular Expression → ε-NFA',
    description: 'Convert regular expressions to epsilon-NFA using Thompson\'s construction',
    status: 'Coming Soon',
  },
  {
    title: 'ε-NFA → NFA',
    description: 'Eliminate epsilon transitions from the automaton',
    status: 'Coming Soon',
  },
  {
    title: 'NFA → DFA',
    description: 'Convert NFA to DFA using subset construction',
    status: 'Coming Soon',
  },
  {
    title: 'DFA Minimization',
    description: 'Minimize DFA states using partition refinement algorithm',
    status: 'Coming Soon',
  },
];

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
                Phase 1: Tokenization & Finite Automata
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 4,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Box textAlign="center" mb={4}>
            <Code sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Lexical Analysis Tools
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Learn about regular expressions, finite automata, and tokenization
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {topics.map((topic, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight={600}>
                        {topic.title}
                      </Typography>
                      <Chip
                        label={topic.status}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {topic.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default LexicalAnalysis;
