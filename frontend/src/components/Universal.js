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
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { PlayArrow, Refresh } from '@mui/icons-material';
import { generateUniversal } from '../services/api';

function Universal() {
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
      const result = await generateUniversal(inputGrammar.trim());
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
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Left Recursion Elimination Tool (LRG → RRG)
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Enter any grammar with left recursion (direct or indirect) to eliminate it
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            label="Input Grammar"
            placeholder={`Enter your grammar here...
Example 1 (Direct):
A -> Aab | c

Example 2 (Indirect):
S -> Aa | bB
A -> Ac | Sd | ε
B -> e | f

Note: Use ε or # for epsilon (empty string)`}
            value={inputGrammar}
            onChange={(e) => setInputGrammar(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={handleGenerate}
              disabled={loading}
            >
              Eliminate Left Recursion
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
          </Box>

          {showResult && (
            <>
              <Divider sx={{ my: 3 }} />

              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Grammar Without Left Recursion:
                </Typography>
                <Typography
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    p: 2,
                    borderRadius: 1
                  }}
                >
                  {transformedGrammar}
                </Typography>
              </Paper>

              <Paper elevation={2} sx={{ p: 3, bgcolor: '#e8f5e9' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Elimination Steps:
                </Typography>
                <List>
                  {steps.map((step, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemText
                        primary={step}
                        primaryTypographyProps={{
                          sx: { fontSize: '0.95rem', lineHeight: 1.6 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
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