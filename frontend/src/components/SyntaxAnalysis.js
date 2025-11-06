// src/components/SyntaxAnalysis.js
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

// Import subsection components
import Theory from './Theory';
import Problems from './Problems';
import Universal from './Universal';
import Helper from './Helper';

const subsections = [
  { id: 'left-recursion', title: 'Left Recursion Elimination', topics: ['LRG → RRG'] },
  { id: 'left-factoring', title: 'Left Factoring', topics: ['Grammar Simplification'] }
];

function SyntaxAnalysis() {
  const navigate = useNavigate();
  const [selectedSubsection, setSelectedSubsection] = useState('left-recursion');
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
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                Syntax Analysis
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Parse tokens and build parse trees
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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                          backgroundColor: 'rgba(240, 147, 251, 0.15)',
                          borderLeft: '4px solid #f093fb',
                          '&:hover': {
                            backgroundColor: 'rgba(240, 147, 251, 0.25)',
                          }
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(240, 147, 251, 0.08)',
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography 
                            fontWeight={selectedSubsection === subsection.id ? 700 : 500}
                            sx={{ 
                              color: selectedSubsection === subsection.id ? '#f093fb' : 'text.primary',
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
                                    ? 'rgba(240, 147, 251, 0.2)' 
                                    : 'rgba(0,0,0,0.05)',
                                  color: selectedSubsection === subsection.id ? '#f093fb' : 'text.secondary'
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
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
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
                {activeTab === 0 && (
                  <Theory topic={selectedSubsection === 'left-recursion' ? 'syntax' : 'left-factoring'} />
                )}
                {activeTab === 1 && (
                  <Problems topic={selectedSubsection} />
                )}
                {activeTab === 2 && (
                  <Universal topic={selectedSubsection} />
                )}
                {activeTab === 3 && (
                  <Helper topic={selectedSubsection} />
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default SyntaxAnalysis;
