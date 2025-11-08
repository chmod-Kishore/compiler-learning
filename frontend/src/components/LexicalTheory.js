// src/components/LexicalTheory.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getLexicalSubsection } from '../services/api';

function LexicalTheory({ subsectionId }) {
  const [subsectionData, setSubsectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState(['concept', 'example', 'doubtClearer']);

  useEffect(() => {
    loadSubsection(subsectionId);
  }, [subsectionId]);

  const loadSubsection = async (id) => {
    try {
      setLoading(true);
      const data = await getLexicalSubsection(id);
      setSubsectionData(data);
      // Reset expanded panels when loading new subsection
      setExpandedPanels(['concept', 'example', 'doubtClearer']);
    } catch (err) {
      console.error('Error loading subsection:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanels(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!subsectionData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="text.secondary">Select a topic to view content</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'white' }}>
      {/* Header */}
      <Box sx={{ p: 3, bgcolor: '#fafafa', borderBottom: '2px solid #667eea' }}>
        <Typography variant="h4" fontWeight={700} color="#667eea" gutterBottom>
          {subsectionData.id} - {subsectionData.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive theory covering concepts, examples, and common doubts
        </Typography>
      </Box>

      {/* Content Sections */}
      <Box sx={{ p: 3 }}>
        {/* Concept Section */}
        <Accordion 
          expanded={expandedPanels.includes('concept')}
          onChange={handleAccordionChange('concept')}
          elevation={0}
          sx={{ 
            mb: 2,
            border: '1px solid #e0e0e0',
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
            '&.Mui-expanded': {
              margin: '0 0 16px 0',
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: '8px',
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
              '& .MuiAccordionSummary-content': {
                my: 1.5
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                📖 Concept
              </Typography>
              <Typography variant="caption" sx={{ 
                bgcolor: '#667eea', 
                color: 'white', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1,
                fontWeight: 600
              }}>
                Core Theory
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3, pt: 2 }}>
            <Box 
              dangerouslySetInnerHTML={{ __html: subsectionData.content.concept }}
              sx={contentStyles}
            />
          </AccordionDetails>
        </Accordion>

        {/* Example Section - Only show if content exists */}
        {subsectionData.content.example && subsectionData.content.example.trim() !== '' && (
        <Accordion 
          expanded={expandedPanels.includes('example')}
          onChange={handleAccordionChange('example')}
          elevation={0}
          sx={{ 
            mb: 2,
            border: '1px solid #e0e0e0',
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
            '&.Mui-expanded': {
              margin: '0 0 16px 0',
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: '8px',
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
              '& .MuiAccordionSummary-content': {
                my: 1.5
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                📝 Example
              </Typography>
              <Typography variant="caption" sx={{ 
                bgcolor: '#4caf50', 
                color: 'white', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1,
                fontWeight: 600
              }}>
                Worked Examples
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3, pt: 2 }}>
            <Box 
              dangerouslySetInnerHTML={{ __html: subsectionData.content.example }}
              sx={contentStyles}
            />
          </AccordionDetails>
        </Accordion>
        )}

        {/* Doubt Clearer Section - Only show if content exists */}
        {subsectionData.content.doubtClearer && subsectionData.content.doubtClearer.trim() !== '' && (
        <Accordion 
          expanded={expandedPanels.includes('doubtClearer')}
          onChange={handleAccordionChange('doubtClearer')}
          elevation={0}
          sx={{ 
            mb: 2,
            border: '1px solid #e0e0e0',
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
            '&.Mui-expanded': {
              margin: '0 0 16px 0',
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: '8px',
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
              '& .MuiAccordionSummary-content': {
                my: 1.5
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                💡 Doubt Clearer
              </Typography>
              <Typography variant="caption" sx={{ 
                bgcolor: '#ff9800', 
                color: 'white', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1,
                fontWeight: 600
              }}>
                FAQs & Tips
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3, pt: 2 }}>
            <Box 
              dangerouslySetInnerHTML={{ __html: subsectionData.content.doubtClearer }}
              sx={contentStyles}
            />
          </AccordionDetails>
        </Accordion>
        )}
      </Box>
    </Box>
  );
}

const contentStyles = {
  '& h3': { 
    mt: 3, 
    mb: 2, 
    color: '#667eea',
    fontWeight: 700,
    fontSize: '1.3rem'
  },
  '& h4': { 
    mt: 2.5, 
    mb: 1.5, 
    fontWeight: 600,
    fontSize: '1.1rem',
    color: '#333'
  },
  '& p': { 
    lineHeight: 1.8, 
    mb: 2,
    fontSize: '0.95rem',
    color: '#444'
  },
  '& ul': { 
    pl: 3,
    mb: 2,
    '& li': {
      mb: 1,
      lineHeight: 1.7
    }
  },
  '& ol': { 
    pl: 3,
    mb: 2,
    '& li': {
      mb: 1.5,
      lineHeight: 1.7
    }
  },
  '& pre': { 
    backgroundColor: '#f8f9fa', 
    p: 2.5, 
    borderRadius: 1,
    overflow: 'auto',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    fontFamily: 'Consolas, Monaco, monospace',
    border: '1px solid #e0e0e0'
  },
  '& code': {
    backgroundColor: '#f8f9fa',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontFamily: 'Consolas, Monaco, monospace',
    color: '#c7254e'
  },
  '& pre code': {
    backgroundColor: 'transparent',
    padding: 0,
    color: 'inherit'
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    my: 3,
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    '& th': {
      backgroundColor: '#667eea',
      color: 'white',
      fontWeight: 600,
      textAlign: 'left',
      p: 1.5,
      border: '1px solid #5568d3'
    },
    '& td': {
      p: 1.5,
      border: '1px solid #e0e0e0',
      backgroundColor: 'white'
    },
    '& tr:nth-of-type(even) td': {
      backgroundColor: '#f8f9fa'
    }
  },
  '& strong': {
    fontWeight: 700,
    color: '#333'
  },
  '& div': {
    mb: 2
  },
  '& blockquote': {
    borderLeft: '4px solid #667eea',
    backgroundColor: '#f5f7ff',
    padding: '12px 20px',
    margin: '16px 0',
    borderRadius: '4px',
    '& p': {
      margin: 0
    }
  }
};

export default LexicalTheory;
