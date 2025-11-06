// src/components/Universal.js
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { PlayArrow, Refresh } from '@mui/icons-material';
import { generateUniversal, generateLeftFactoring } from '../services/api';

function Universal({ topic = 'left-recursion' }) {
  const [inputGrammar, setInputGrammar] = useState('');
  const [transformedGrammar, setTransformedGrammar] = useState('');
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleGenerate = async () => {
    if (!inputGrammar.trim()) {
      setSnackbar({ open: true, message: 'Please enter a grammar', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Use appropriate service based on topic
      const result = topic === 'left-factoring'
        ? await generateLeftFactoring(inputGrammar.trim())
        : await generateUniversal(inputGrammar.trim());
      setTransformedGrammar(result.transformedGrammar);
      setSteps(result.steps);
      setShowResult(true);
    } catch (err) {
      console.error('Error generating transformation:', err);
      setSnackbar({ open: true, message: 'Error processing grammar', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputGrammar('');
    setTransformedGrammar('');
    setSteps([]);
    setShowResult(false);
  };

  return (
    <>
      <Card 
        sx={{ 
          mt: 2,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.15)',
          border: '1px solid rgba(76, 175, 80, 0.1)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 1
              }}
            >
              {topic === 'left-factoring' 
                ? 'Left Factoring Tool' 
                : 'Left Recursion Elimination Tool (LRG → RRG)'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {topic === 'left-factoring'
                ? 'Enter any grammar with common prefixes to perform left factoring'
                : 'Enter any grammar with left recursion (direct or indirect) to eliminate it'}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            label="Input Grammar"
            placeholder={topic === 'left-factoring' 
              ? `Enter your grammar here...
Example 1:
S -> iEtS | iEtSeS | a
E -> b

Example 2:
A -> abcd | abef | xyz

Note: Productions with common prefixes will be factored`
              : `Enter your grammar here...
Example 1 (Direct):
A -> Aab | c

Example 2 (Indirect):
S -> Aa | bB
A -> Ac | Sd | ε
B -> e | f

Note: Use ε or # for epsilon (empty string)`}
            value={inputGrammar}
            onChange={(e) => setInputGrammar(e.target.value)}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                borderRadius: 2,
                fontSize: '0.95rem',
                fontFamily: '"Fira Code", "Consolas", monospace',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                  borderWidth: 2
                },
                '&:hover fieldset': {
                  borderColor: '#4caf50',
                  borderWidth: 2
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4caf50',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 600,
                color: '#666',
                '&.Mui-focused': {
                  color: '#4caf50',
                  fontWeight: 700
                }
              }
            }}
          />

          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={handleGenerate}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.6)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 10px rgba(76, 175, 80, 0.4)'
                },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                  color: '#999'
                }
              }}
            >
              {loading ? 'Processing...' : (topic === 'left-factoring' ? 'Perform Left Factoring' : 'Eliminate Left Recursion')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Refresh />}
              onClick={handleReset}
              disabled={loading}
              sx={{
                borderWidth: 2,
                borderColor: '#ff9800',
                color: '#ff9800',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#f57c00',
                  backgroundColor: 'rgba(255, 152, 0, 0.05)',
                  transform: 'rotate(-15deg) scale(1.05)'
                },
                '&.Mui-disabled': {
                  borderColor: '#e0e0e0',
                  color: '#999'
                }
              }}
            >
              Reset
            </Button>
          </Box>

          {showResult && (
            <>
              <Divider sx={{ my: 3 }} />

              {/* Grammar Output Section */}
              <Paper 
                elevation={3} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #c8e6c9'
                }}
              >
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                    p: 2,
                    borderBottom: '2px solid #4caf50'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#2e7d32',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box component="span" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>✅</Box>
                    {topic === 'left-factoring' ? 'Factored Grammar' : 'Grammar Without Left Recursion'}
                  </Typography>
                </Box>
                <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2.5,
                      bgcolor: '#ffffff',
                      border: '1px solid #c8e6c9',
                      borderRadius: 2,
                      fontFamily: '"Fira Code", "Consolas", "Monaco", monospace'
                    }}
                  >
                    <Typography
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        color: '#1b5e20',
                        margin: 0,
                        fontWeight: 500
                      }}
                    >
                      {transformedGrammar}
                    </Typography>
                  </Paper>
                </Box>
              </Paper>

              {/* Elimination Steps Section */}
              <Paper 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #e3f2fd'
                }}
              >
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    p: 2,
                    borderBottom: '2px solid #2196f3'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#1565c0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box component="span" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>📋</Box>
                    {topic === 'left-factoring' ? 'Factoring Steps' : 'Elimination Steps'}
                  </Typography>
                </Box>
                <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                  {(() => {
                    // Group steps: combine step header with its content lines
                    const groupedSteps = [];
                    let currentStep = null;
                    
                    steps.forEach((line, index) => {
                      const isStepHeader = line.includes('🔹 Step');
                      
                      if (isStepHeader) {
                        // Save previous step if exists
                        if (currentStep) {
                          groupedSteps.push(currentStep);
                        }
                        // Start new step
                        currentStep = {
                          title: line,
                          content: []
                        };
                      } else if (currentStep) {
                        // Add content to current step (skip empty strings)
                        if (line.trim()) {
                          currentStep.content.push(line);
                        }
                      }
                    });
                    
                    // Add last step
                    if (currentStep) {
                      groupedSteps.push(currentStep);
                    }
                    
                    // Render grouped steps
                    return groupedSteps.map((step, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 2.5,
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        {/* Step Title */}
                        <Typography 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#1565c0',
                            mb: step.content.length > 0 ? 1.5 : 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {step.title}
                        </Typography>
                        
                        {/* Step Content */}
                        {step.content.length > 0 && (
                          <Typography
                            component="div"
                            sx={{
                              fontSize: '0.9rem',
                              lineHeight: 1.8,
                              color: '#424242',
                              pl: 3
                            }}
                          >
                            {step.content.map((line, lIndex) => {
                              // Split lines that contain \n (like final grammar output)
                              const subLines = line.includes('\n') ? line.split('\n') : [line];
                              
                              return subLines.map((subLine, sIndex) => (
                                <Box 
                                  key={`${lIndex}-${sIndex}`} 
                                  sx={{ 
                                    mb: 0.5,
                                    fontFamily: subLine.includes('→') || subLine.includes('α') || subLine.includes('β') || subLine.includes('->') || subLine.includes('ε') || subLine.includes('′')
                                      ? '"Fira Code", "Consolas", monospace' 
                                      : '"Segoe UI", "Roboto", sans-serif'
                                  }}
                                >
                                  {subLine}
                                </Box>
                              ));
                            })}
                          </Typography>
                        )}
                      </Box>
                    ));
                  })()}
                </Box>
              </Paper>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Universal;