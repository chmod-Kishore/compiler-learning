// src/components/Problems.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import { CheckCircle, NavigateNext, NavigateBefore } from '@mui/icons-material';
import { getProblems, verifyAnswer, getLeftFactoringProblems, verifyLeftFactoringAnswer } from '../services/api';

function Problems({ topic = 'left-recursion' }) {
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadProblems();
  }, [topic]);

  const loadProblems = async () => {
    try {
      // Fetch problems based on topic
      const data = topic === 'left-factoring' 
        ? await getLeftFactoringProblems() 
        : await getProblems();
      setProblems(data);
    } catch (err) {
      console.error('Error loading problems:', err);
      setSnackbar({ open: true, message: 'Failed to load problems', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!userAnswer.trim()) {
      setSnackbar({ open: true, message: 'Please enter an answer', severity: 'warning' });
      return;
    }

    setVerifying(true);
    try {
      // Use appropriate verify function based on topic
      const result = topic === 'left-factoring'
        ? await verifyLeftFactoringAnswer(currentProblem.id, userAnswer.trim())
        : await verifyAnswer(currentProblem.id, userAnswer.trim());
      
      if (result.correct) {
        setSnackbar({ open: true, message: '✓ Correct!', severity: 'success' });
        setShowExplanation(false);
        setUserAnswer('');
        
        // Move to next problem after a delay
        if (currentIndex < problems.length - 1) {
          setTimeout(() => handleNext(), 1500);
        }
      } else {
        setSnackbar({ open: true, message: '✗ Incorrect', severity: 'error' });
        setShowExplanation(true);
        setExplanation(result.explanation || '');
        setCorrectAnswer(result.correctAnswer || '');
      }
    } catch (err) {
      console.error('Error verifying answer:', err);
      setSnackbar({ open: true, message: 'Error verifying answer', severity: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer('');
      setShowExplanation(false);
    }
  };

  const currentProblem = problems[currentIndex];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentProblem) {
    return <Typography>No problems available</Typography>;
  }

  return (
    <>
      <Card 
        sx={{ 
          mt: 2,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Problem {currentIndex + 1} of {problems.length}
            </Typography>
          </Box>

          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
              border: '2px solid #ab47bc',
              boxShadow: '0 4px 12px rgba(171, 71, 188, 0.2)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography 
                sx={{ 
                  fontSize: '1.5rem',
                  lineHeight: 1
                }}
              >
                ❓
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: '#6a1b9a'
                }}
              >
                Question:
              </Typography>
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid #ce93d8'
              }}
            >
              <Typography 
                component="pre" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: '"Fira Code", "Consolas", monospace',
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                  color: '#424242',
                  margin: 0
                }}
              >
                {currentProblem.question}
              </Typography>
            </Paper>
          </Paper>

          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Your Answer"
            placeholder="Enter the grammar without left recursion..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
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
                  borderColor: '#667eea',
                  borderWidth: 2
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 600,
                color: '#666',
                '&.Mui-focused': {
                  color: '#667eea',
                  fontWeight: 700
                }
              }
            }}
          />

          <Box display="flex" gap={2} mb={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={verifying ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              onClick={handleVerify}
              disabled={verifying}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)'
                },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                  color: '#999'
                }
              }}
            >
              {verifying ? 'Verifying...' : 'Verify Answer'}
            </Button>
          </Box>

          {showExplanation && (
            <Paper 
              elevation={3} 
              sx={{ 
                mt: 3, 
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e3f2fd'
              }}
            >
              {/* Explanation Header */}
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
                  <Box 
                    component="span" 
                    sx={{ 
                      fontSize: '1.5rem',
                      lineHeight: 1 
                    }}
                  >
                    💡
                  </Box>
                  Explanation
                </Typography>
              </Box>

              {/* Explanation Content */}
              <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                {explanation.split('\n\n').map((paragraph, pIndex) => {
                  const lines = paragraph.split('\n');
                  const isStep = lines[0].includes('🔹 Step');
                  
                  if (isStep) {
                    const stepTitle = lines[0];
                    const stepContent = lines.slice(1).join('\n');
                    
                    return (
                      <Box 
                        key={pIndex} 
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
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {stepTitle.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={i}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </Typography>
                        
                        {/* Step Content */}
                        <Typography 
                          component="div"
                          sx={{ 
                            fontSize: '0.9rem',
                            lineHeight: 1.8,
                            color: '#424242',
                            pl: 3
                          }}
                        >
                          {stepContent.split('\n').map((line, lIndex) => {
                            // Convert **text** to bold
                            const renderLineWithBold = (text) => {
                              const parts = text.split(/(\*\*.*?\*\*)/g);
                              return parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={i}>{part.slice(2, -2)}</strong>;
                                }
                                return part;
                              });
                            };

                            return (
                              <Box 
                                key={lIndex} 
                                sx={{ 
                                  mb: 0.5,
                                  fontFamily: line.includes('→') || line.includes('α') || line.includes('β') 
                                    ? '"Fira Code", "Consolas", monospace' 
                                    : '"Segoe UI", "Roboto", sans-serif'
                                }}
                              >
                                {renderLineWithBold(line)}
                              </Box>
                            );
                          })}
                        </Typography>
                      </Box>
                    );
                  }
                  
                  // Regular paragraph (non-step content)
                  return (
                    <Typography 
                      key={pIndex}
                      sx={{ 
                        mb: 1.5,
                        fontSize: '0.95rem',
                        lineHeight: 1.8,
                        color: '#424242'
                      }}
                    >
                      {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </Typography>
                  );
                })}
              </Box>

              {/* Correct Answer Section */}
              <Box 
                sx={{ 
                  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                  p: 2,
                  borderTop: '2px solid #4caf50',
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
                    gap: 1,
                    mb: 2
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      fontSize: '1.5rem',
                      lineHeight: 1 
                    }}
                  >
                    ✅
                  </Box>
                  Correct Answer
                </Typography>

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
                    {correctAnswer}
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          )}
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<NavigateBefore />}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          sx={{
            borderWidth: 2,
            borderColor: '#667eea',
            color: '#667eea',
            fontWeight: 600,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderWidth: 2,
              borderColor: '#764ba2',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              transform: 'translateX(-3px)'
            },
            '&.Mui-disabled': {
              borderColor: '#e0e0e0',
              color: '#999'
            }
          }}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          size="large"
          endIcon={<NavigateNext />}
          onClick={handleNext}
          disabled={currentIndex === problems.length - 1}
          sx={{
            borderWidth: 2,
            borderColor: '#667eea',
            color: '#667eea',
            fontWeight: 600,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderWidth: 2,
              borderColor: '#764ba2',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              transform: 'translateX(3px)'
            },
            '&.Mui-disabled': {
              borderColor: '#e0e0e0',
              color: '#999'
            }
          }}
        >
          Next
        </Button>
      </Box>

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

export default Problems;