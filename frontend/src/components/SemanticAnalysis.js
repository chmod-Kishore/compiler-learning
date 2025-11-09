// src/components/SemanticAnalysis.js
import React, { useState } from 'react';
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
import SemanticTheory from './SemanticTheory';
import SemanticPracticeInteractive from './SemanticPracticeInteractive';
import SemanticSolverTopicSpecific from './SemanticSolverTopicSpecific';
import SemanticHelperIntelligent from './SemanticHelperIntelligent';

const subsections = [
  { 
    id: '3.1', 
    title: 'Type Checking', 
    topics: ['Type Systems', 'Type Rules'], 
    topicKey: 'type-checking' 
  },
  { 
    id: '3.2', 
    title: 'Syntax-Directed Translation', 
    topics: ['SDT Schemes', 'Translation Rules'], 
    topicKey: 'sdt' 
  },
  { 
    id: '3.3', 
    title: 'Attribute Grammars', 
    topics: ['Synthesized', 'Inherited'], 
    topicKey: 'attributes' 
  },
  { 
    id: '3.4', 
    title: 'Symbol Table', 
    topics: ['Scope', 'Declarations'], 
    topicKey: 'symbol-table' 
  },
  { 
    id: '3.5', 
    title: 'Semantic Actions', 
    topics: ['Action Routines', 'Error Recovery'], 
    topicKey: 'semantic-actions' 
  }
];

function SemanticAnalysis() {
  const [selectedSubsection, setSelectedSubsection] = useState('3.1');
  const [activeTab, setActiveTab] = useState(0);

  const handleSubsectionChange = (subsectionId) => {
    setSelectedSubsection(subsectionId);
    setActiveTab(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    // Navigate back to main page
    window.history.back();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
          color: 'white',
          py: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="xl">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={handleBack}
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
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Phase 3: Type Checking & Semantic Validation
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
                background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
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
                          backgroundColor: 'rgba(0, 172, 193, 0.15)',
                          borderLeft: '4px solid #00acc1',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 172, 193, 0.25)',
                          }
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(0, 172, 193, 0.08)',
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography 
                            fontWeight={selectedSubsection === subsection.id ? 700 : 500}
                            sx={{ 
                              color: selectedSubsection === subsection.id ? '#00acc1' : 'text.primary',
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
                                    ? 'rgba(0, 172, 193, 0.2)' 
                                    : 'rgba(0,0,0,0.05)',
                                  color: selectedSubsection === subsection.id ? '#00acc1' : 'text.secondary'
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
                  background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)'
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
                {activeTab === 0 && <SemanticTheory subsectionId={selectedSubsection} />}
                {activeTab === 1 && <SemanticPracticeInteractive topic={subsections.find(s => s.id === selectedSubsection)?.topicKey || 'type-checking'} />}
                {activeTab === 2 && <SemanticSolverTopicSpecific topic={subsections.find(s => s.id === selectedSubsection)?.topicKey || 'type-checking'} />}
                {activeTab === 3 && <SemanticHelperIntelligent topic={subsections.find(s => s.id === selectedSubsection)?.topicKey || 'type-checking'} />}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default SemanticAnalysis;