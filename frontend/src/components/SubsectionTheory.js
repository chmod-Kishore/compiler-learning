// src/components/SubsectionTheory.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Paper, 
  Typography,
  CircularProgress,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { getLexicalSubsection } from '../services/api';

const subsections = [
  { id: '1.1', title: 'Regular Expression to ε-NFA' },
  { id: '1.2', title: 'ε-NFA to NFA' },
  { id: '1.3', title: 'NFA to DFA' },
  { id: '1.4', title: 'DFA Minimization' },
  { id: '1.5', title: 'Miscellaneous Conversions' }
];

function SubsectionTheory() {
  const [selectedSubsection, setSelectedSubsection] = useState('1.1');
  const [subsectionData, setSubsectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadSubsection(selectedSubsection);
  }, [selectedSubsection]);

  const loadSubsection = async (id) => {
    try {
      setLoading(true);
      const data = await getLexicalSubsection(id);
      setSubsectionData(data);
      setActiveTab(0); // Reset to concept tab when switching subsections
    } catch (err) {
      console.error('Error loading subsection:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubsectionClick = (id) => {
    setSelectedSubsection(id);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: '600px' }}>
      {/* Left Sidebar - Topics */}
      <Paper 
        elevation={0} 
        sx={{ 
          width: 280, 
          borderRight: '1px solid #e0e0e0',
          borderRadius: 0,
          overflow: 'auto'
        }}
      >
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight={600} color="primary">
            Topics
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {subsections.map((subsection) => (
            <ListItem key={subsection.id} disablePadding>
              <ListItemButton
                selected={selectedSubsection === subsection.id}
                onClick={() => handleSubsectionClick(subsection.id)}
                sx={{
                  py: 2,
                  '&.Mui-selected': {
                    bgcolor: '#e3f2fd',
                    borderLeft: '4px solid #2196F3',
                    '&:hover': {
                      bgcolor: '#e3f2fd',
                    },
                  },
                }}
              >
                <ListItemText 
                  primary={
                    <Box>
                      <Typography variant="body2" color="primary" fontWeight={600}>
                        {subsection.id}
                      </Typography>
                      <Typography variant="body2">
                        {subsection.title}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Right Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : subsectionData ? (
          <>
            {/* Header */}
            <Box sx={{ p: 3, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {subsectionData.id} - {subsectionData.title}
              </Typography>
            </Box>

            {/* Tabs for Concept, Example, Doubt Clearer */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{
                  px: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                  },
                }}
              >
                <Tab label="📖 Concept" />
                <Tab label="📝 Example" />
                <Tab label="💡 Doubt Clearer" />
              </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'white', p: 3 }}>
              {activeTab === 0 && (
                <Box 
                  dangerouslySetInnerHTML={{ __html: subsectionData.content.concept }}
                  sx={contentStyles}
                />
              )}
              {activeTab === 1 && (
                <Box 
                  dangerouslySetInnerHTML={{ __html: subsectionData.content.example }}
                  sx={contentStyles}
                />
              )}
              {activeTab === 2 && (
                <Box 
                  dangerouslySetInnerHTML={{ __html: subsectionData.content.doubtClearer }}
                  sx={contentStyles}
                />
              )}
            </Box>
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Typography color="text.secondary">Select a topic to view content</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

const contentStyles = {
  '& h3': { 
    mt: 2, 
    mb: 2, 
    color: 'primary.main',
    fontWeight: 600 
  },
  '& h4': { 
    mt: 2, 
    mb: 1.5, 
    fontWeight: 600,
    fontSize: '1.1rem'
  },
  '& p': { 
    lineHeight: 1.8, 
    mb: 2,
    fontSize: '0.95rem'
  },
  '& ul': { 
    pl: 3,
    mb: 2,
    '& li': {
      mb: 1
    }
  },
  '& ol': { 
    pl: 3,
    mb: 2,
    '& li': {
      mb: 1.5
    }
  },
  '& pre': { 
    backgroundColor: '#f5f5f5', 
    p: 2, 
    borderRadius: 1,
    overflow: 'auto',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    fontFamily: 'Consolas, Monaco, monospace'
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    my: 2,
    fontSize: '0.9rem',
    '& th': {
      backgroundColor: '#e3f2fd',
      fontWeight: 600,
      textAlign: 'left',
      p: 1.5,
      border: '1px solid #ddd'
    },
    '& td': {
      p: 1.5,
      border: '1px solid #ddd'
    }
  },
  '& strong': {
    fontWeight: 600
  },
  '& div': {
    mb: 2
  }
};

export default SubsectionTheory;
