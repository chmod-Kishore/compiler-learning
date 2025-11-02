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
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Explanation:</Typography>
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {explanation}
              </Typography>
              <Typography variant="h6" gutterBottom>Correct Answer:</Typography>
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {correctAnswer}
              </Typography>
            </Alert>
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