// src/components/LexicalAnalysis.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Divider,
  Chip
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

// Import components for each tab
import LexicalTheory from './LexicalTheory';
import LexicalPractice from './LexicalPractice';
import LexicalSolver from './LexicalSolver';
import LexicalHelper from './LexicalHelper';

const subsections = [
  { id: '1.1', title: 'Regular Expression to ε-NFA', topics: ['Thompson Construction'], topicKey: 'thompson' },
  { id: '1.2', title: 'ε-NFA to NFA', topics: ['ε-closure'], topicKey: 'epsilon' },
  { id: '1.3', title: 'NFA to DFA', topics: ['Subset Construction'], topicKey: 'subset' },
  { id: '1.4', title: 'DFA Minimization', topics: ['Equivalence Classes'], topicKey: 'minimization' },
  { id: '1.5', title: 'Miscellaneous Conversions', topics: ['Multi-Step Conversions'], topicKey: 'miscellaneous' }
];

function LexicalAnalysis() {
  const navigate = useNavigate();
  const [selectedSubsection, setSelectedSubsection] = useState('1.1');
  const [activeTab, setActiveTab] = useState(0);

  const handleSubsectionChange = (subsectionId) => {
    setSelectedSubsection(subsectionId);
    setActiveTab(0); // Reset to first tab when changing subsection
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
        <Container maxWidth="xl">
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
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Phase 1: RE → ε-NFA → NFA → DFA → Min DFA
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Box display="flex" gap={3}>
          {/* Left Sidebar - Subsections */}
          <Paper 
            elevation={2} 
            sx={{ 
              width: 280, 
              flexShrink: 0,
              borderRadius: 2,
              overflow: 'hidden',
              height: 'fit-content',
              position: 'sticky',
              top: 20
            }}
          >
            <Box 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 2,
                color: 'white'
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Topics
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {subsections.map((subsection, index) => (
                <React.Fragment key={subsection.id}>
                  {index > 0 && <Divider />}
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedSubsection === subsection.id}
                      onClick={() => handleSubsectionChange(subsection.id)}
                      sx={{
                        py: 2,
                        px: 2.5,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(102, 126, 234, 0.15)',
                          borderLeft: '4px solid #667eea',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.25)',
                          }
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography 
                            fontWeight={selectedSubsection === subsection.id ? 700 : 500}
                            sx={{ 
                              color: selectedSubsection === subsection.id ? '#667eea' : 'text.primary',
                              fontSize: '0.95rem'
                            }}
                          >
                            {subsection.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {subsection.topics.map((topic, idx) => (
                              <Chip 
                                key={idx}
                                label={topic}
                                size="small"
                                sx={{ 
                                  fontSize: '0.7rem',
                                  height: 20,
                                  backgroundColor: selectedSubsection === subsection.id 
                                    ? 'rgba(102, 126, 234, 0.2)' 
                                    : 'rgba(0,0,0,0.05)',
                                  color: selectedSubsection === subsection.id ? '#667eea' : 'text.secondary'
                                }}
                              />
                            ))}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Right Content Area */}
          <Box sx={{ flexGrow: 1 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {/* Tabs */}
              <Box 
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      minHeight: 64,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      },
                      '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.15)'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'white',
                      height: 3
                    }
                  }}
                >
                  <Tab label="📖 Theory" />
                  <Tab label="📝 Problems" />
                  <Tab label="🔧 Solver" />
                  <Tab label="💡 Helper" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 0, bgcolor: '#fafafa', minHeight: '70vh' }}>
                {activeTab === 0 && <LexicalTheory subsectionId={selectedSubsection} />}
                {activeTab === 1 && <LexicalPractice topic={subsections.find(s => s.id === selectedSubsection)?.topicKey || 'thompson'} />}
                {activeTab === 2 && <LexicalSolver topic={subsections.find(s => s.id === selectedSubsection)?.topicKey || 'thompson'} />}
                {activeTab === 3 && <LexicalHelper topic={subsections.find(s => s.id === selectedSubsection)?.topicKey || 'thompson'} />}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default LexicalAnalysis;
