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
            Universal Grammar Converter
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Enter any LR Grammar to convert to Reduced Regular Grammar
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            label="Input Grammar (LRG)"
            placeholder={`Enter your LR Grammar here...
Example:
S -> aA | bB
A -> aS | a
B -> bS | b`}
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
              Generate
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
                  Transformed Grammar (RRG):
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
                  Transformation Steps:
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