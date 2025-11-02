import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Fade,
} from '@mui/material';
import {
  Code,
  AccountTree,
  Analytics,
  Transform,
} from '@mui/icons-material';

const phases = [
  {
    id: 1,
    title: 'Lexical Analysis',
    description: 'Convert source code into meaningful tokens',
    icon: Code,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    topics: ['R.E → ε-NFA', 'ε-NFA → NFA', 'NFA → DFA', 'DFA Minimization'],
    path: '/lexical',
  },
  {
    id: 2,
    title: 'Syntax Analysis',
    description: 'Parse tokens and build parse trees',
    icon: AccountTree,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    topics: ['LRG → RRG', 'Left Factoring', 'First & Follow', 'LL(1)', 'LR Parsers'],
    path: '/syntax',
  },
  {
    id: 3,
    title: 'Semantic Analysis',
    description: 'Check semantic consistency and build annotated trees',
    icon: Analytics,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    topics: ['Annotated Parse Tree', 'Dependency Graph', 'Syntax Tree'],
    path: '/semantic',
  },
  {
    id: 4,
    title: 'Intermediate Code',
    description: 'Generate machine-independent intermediate representations',
    icon: Transform,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    topics: ['DAG', 'Abstract Syntax Tree', 'Three Address Code'],
    path: '/intermediate',
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Compiler Design Learning
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
              }}
            >
              Master all phases of compiler construction
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {phases.map((phase, index) => (
            <Grid item xs={12} md={6} key={phase.id}>
              <Fade in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(phase.path)}
                    sx={{ height: '100%' }}
                  >
                    <Box
                      sx={{
                        background: phase.color,
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <phase.icon
                        sx={{
                          fontSize: 48,
                          color: 'white',
                        }}
                      />
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                          }}
                        >
                          {phase.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255,255,255,0.9)',
                          }}
                        >
                          Phase {phase.id}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {phase.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {phase.topics.map((topic, idx) => (
                          <Chip
                            key={idx}
                            label={topic}
                            size="small"
                            sx={{
                              background: phase.color,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
