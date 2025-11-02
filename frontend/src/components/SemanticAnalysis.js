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
import { ArrowBack, Analytics } from '@mui/icons-material';

const topics = [
  {
    title: 'Annotated Parse Tree',
    description: 'Build parse trees with semantic annotations and attributes',
    status: 'Coming Soon',
  },
  {
    title: 'Dependency Graph',
    description: 'Analyze dependencies between semantic attributes',
    status: 'Coming Soon',
  },
  {
    title: 'Syntax Tree',
    description: 'Construct abstract and concrete syntax trees',
    status: 'Coming Soon',
  },
];

function SemanticAnalysis() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
                Semantic Analysis
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Phase 3: Type Checking & Semantic Validation
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
            <Analytics sx={{ fontSize: 60, color: '#4facfe', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Semantic Analysis Tools
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Understand semantic rules, type checking, and attribute grammars
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {topics.map((topic, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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

export default SemanticAnalysis;
