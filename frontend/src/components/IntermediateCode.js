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
import { ArrowBack, Transform } from '@mui/icons-material';

const topics = [
  {
    title: 'Directed Acyclic Graph (DAG)',
    description: 'Build DAG representations for optimizing basic blocks',
    status: 'Coming Soon',
  },
  {
    title: 'Abstract Syntax Tree (AST)',
    description: 'Generate abstract syntax trees for source programs',
    status: 'Coming Soon',
  },
  {
    title: 'Three Address Code (TAC)',
    description: 'Generate and optimize three-address code instructions',
    status: 'Coming Soon',
  },
];

function IntermediateCode() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
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
                Intermediate Code Generation
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Phase 4: Machine-Independent Code
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
            <Transform sx={{ fontSize: 60, color: '#43e97b', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Intermediate Code Tools
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Learn to generate and optimize intermediate representations
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
                          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
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

export default IntermediateCode;
