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
import { getProblems, verifyAnswer } from '../services/api';

function Problems() {
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
  }, []);

  const loadProblems = async () => {
    try {
      const data = await getProblems();
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
      const result = await verifyAnswer(currentProblem.id, userAnswer.trim());
      
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
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Problem {currentIndex + 1} of {problems.length}
          </Typography>

          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>Question:</Typography>
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {currentProblem.question}
            </Typography>
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
            sx={{ mb: 2 }}
          />

          <Box display="flex" gap={2} mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={verifying ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              onClick={handleVerify}
              disabled={verifying}
            >
              Verify
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
                <Typography 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                    fontSize: '0.95rem',
                    color: '#424242',
                    fontFamily: '"Segoe UI", "Roboto", "Helvetica", sans-serif',
                    '& strong': {
                      color: '#1976d2',
                      fontWeight: 600
                    }
                  }}
                >
                  {explanation.split('\n').map((line, index) => {
                    // Format numbered steps with bold
                    if (line.match(/^\d+\./)) {
                      return (
                        <Box key={index} sx={{ mb: 1, mt: index > 0 ? 1.5 : 0 }}>
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#1976d2',
                              fontSize: '1rem'
                            }}
                          >
                            {line}
                          </Typography>
                        </Box>
                      );
                    }
                    return <Box key={index} sx={{ mb: 0.5 }}>{line}</Box>;
                  })}
                </Typography>
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

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          endIcon={<NavigateNext />}
          onClick={handleNext}
          disabled={currentIndex === problems.length - 1}
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