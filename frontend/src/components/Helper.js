// src/components/Helper.js
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Help, Lightbulb, CheckCircle } from '@mui/icons-material';
import { getHelp, getLeftFactoringHelp } from '../services/api';

const LEFT_RECURSION_STEPS = [
  { value: 1, label: 'Step 1: Identify the Type of Recursion' },
  { value: 2, label: 'Step 2: Substitute' },
  { value: 3, label: 'Step 3: Separate α and β' },
  { value: 4, label: 'Step 4: Create New Variable' },
  { value: 5, label: 'Step 5: Rewrite Final Grammar' }
];

const LEFT_FACTORING_STEPS = [
  { value: 1, label: 'Step 1: Identify Common Prefixes' },
  { value: 2, label: 'Step 2: Group Productions by Prefix' },
  { value: 3, label: 'Step 3: Create New Variable' },
  { value: 4, label: 'Step 4: Rewrite Productions' },
  { value: 5, label: 'Step 5: Verify Final Grammar' }
];

function Helper({ topic = 'left-recursion' }) {
  const STEPS = topic === 'left-factoring' ? LEFT_FACTORING_STEPS : LEFT_RECURSION_STEPS;
  const [inputGrammar, setInputGrammar] = useState('');
  const [stuckAtStep, setStuckAtStep] = useState('');
  const [studentWork, setStudentWork] = useState('');
  const [loading, setLoading] = useState(false);
  const [helpResponse, setHelpResponse] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Helper function to render text with bold markers (**text**)
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    const parts = [];
    let currentIndex = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > currentIndex) {
        parts.push(
          <span key={`text-${currentIndex}`}>
            {text.substring(currentIndex, match.index)}
          </span>
        );
      }
      
      // Add the bold part
      parts.push(
        <strong key={`bold-${match.index}`} style={{ fontWeight: 700 }}>
          {match[1]}
        </strong>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(
        <span key={`text-${currentIndex}`}>
          {text.substring(currentIndex)}
        </span>
      );
    }
    
    return parts.length > 0 ? parts : text;
  };

  const handleGetHelp = async () => {
    if (!inputGrammar.trim()) {
      setSnackbar({ open: true, message: 'Please enter the grammar', severity: 'warning' });
      return;
    }

    if (!stuckAtStep) {
      setSnackbar({ open: true, message: 'Please select which step you are stuck at', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const helpRequest = {
        grammar: inputGrammar.trim(),
        stuckAtStep: parseInt(stuckAtStep),
        studentWork: studentWork.trim()
      };
      
      // Use appropriate helper service based on topic
      const result = topic === 'left-factoring'
        ? await getLeftFactoringHelp(helpRequest)
        : await getHelp(helpRequest);
      
      setHelpResponse(result);
    } catch (err) {
      console.error('Error getting help:', err);
      setSnackbar({ open: true, message: 'Error getting help. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputGrammar('');
    setStuckAtStep('');
    setStudentWork('');
    setHelpResponse(null);
  };

  return (
    <>
      <Card 
        sx={{ 
          mt: 2,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(255, 152, 0, 0.15)',
          border: '1px solid rgba(255, 152, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Help sx={{ fontSize: 36, color: '#ff9800', mr: 1.5 }} />
            <Typography 
              variant="h5"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Stuck? Get Help!
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Tell us where you're stuck, and we'll help you identify mistakes and guide you to the solution
            {topic === 'left-factoring' && ' with left factoring'}
          </Typography>

          {/* Input Grammar */}
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label={topic === 'left-factoring' ? 'Original Grammar (with common prefixes)' : 'Original Grammar (LRG)'}
            placeholder={topic === 'left-factoring'
              ? 'Enter the original grammar with common prefixes...\nExample:\nS -> iEtS | iEtSeS | a'
              : 'Enter the original grammar with left recursion...\nExample:\nA -> Aab | c'}
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
                  borderColor: '#ff9800',
                  borderWidth: 2
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff9800',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(255, 152, 0, 0.1)'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 600,
                color: '#666',
                '&.Mui-focused': {
                  color: '#ff9800',
                  fontWeight: 700
                }
              }
            }}
          />

          {/* Progress Stepper */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              {topic === 'left-factoring' ? 'Factoring Process:' : 'Elimination Process:'}
            </Typography>
            <Stepper activeStep={stuckAtStep ? parseInt(stuckAtStep) - 1 : -1} alternativeLabel>
              {STEPS.map((step) => (
                <Step key={step.value}>
                  <StepLabel>{`Step ${step.value}`}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Step Selection */}
          <FormControl 
            fullWidth 
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#ffffff',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                  borderWidth: 2
                },
                '&:hover fieldset': {
                  borderColor: '#ff9800',
                  borderWidth: 2
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff9800',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(255, 152, 0, 0.1)'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 600,
                color: '#666',
                '&.Mui-focused': {
                  color: '#ff9800',
                  fontWeight: 700
                }
              }
            }}
          >
            <InputLabel>I'm stuck at...</InputLabel>
            <Select
              value={stuckAtStep}
              label="I'm stuck at..."
              onChange={(e) => setStuckAtStep(e.target.value)}
            >
              <MenuItem value="">
                <em>Select a step</em>
              </MenuItem>
              {STEPS.map((step) => (
                <MenuItem key={step.value} value={step.value}>
                  {step.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Student's Work */}
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Your Work So Far (Optional)"
            placeholder="Enter what you've tried so far...&#10;This helps us give you better guidance"
            value={studentWork}
            onChange={(e) => setStudentWork(e.target.value)}
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
                  borderColor: '#ff9800',
                  borderWidth: 2
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff9800',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(255, 152, 0, 0.1)'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 600,
                color: '#666',
                '&.Mui-focused': {
                  color: '#ff9800',
                  fontWeight: 700
                }
              }
            }}
          />

          {/* Action Buttons */}
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Help />}
              onClick={handleGetHelp}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
                  boxShadow: '0 6px 20px rgba(255, 152, 0, 0.6)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 10px rgba(255, 152, 0, 0.4)'
                },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                  color: '#999'
                }
              }}
            >
              {loading ? 'Analyzing...' : 'Get Help'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleReset}
              disabled={loading}
              sx={{
                borderWidth: 2,
                borderColor: '#9e9e9e',
                color: '#616161',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#616161',
                  backgroundColor: 'rgba(158, 158, 158, 0.05)'
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

          {/* Help Response */}
          {helpResponse && (
            <>
              {/* Analysis & Progress */}
              {helpResponse.analysis && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: helpResponse.isCorrect ? '2px solid #4caf50' : '2px solid #2196f3'
                  }}
                >
                  <Box 
                    sx={{ 
                      background: helpResponse.isCorrect 
                        ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      p: 2,
                      borderBottom: helpResponse.isCorrect ? '2px solid #4caf50' : '2px solid #2196f3'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: helpResponse.isCorrect ? '#2e7d32' : '#1565c0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {helpResponse.isCorrect ? <CheckCircle /> : '📊'}
                      {helpResponse.isCorrect ? 'Perfect Solution!' : 'Analysis of Your Work'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                    <Typography
                      component="div"
                      sx={{
                        fontSize: '1rem',
                        lineHeight: 2,
                        whiteSpace: 'pre-wrap',
                        mb: 2,
                        '& strong': {
                          color: helpResponse.isCorrect ? '#2e7d32' : '#1565c0',
                          fontWeight: 700
                        }
                      }}
                    >
                      {renderFormattedText(helpResponse.analysis)}
                    </Typography>
                    
                    {helpResponse.progressPercentage !== undefined && helpResponse.progressPercentage < 100 && (
                      <Box 
                        sx={{ 
                          mt: 3,
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#616161' }}>
                            Your Progress
                          </Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight={700} 
                            sx={{ 
                              color: helpResponse.progressPercentage > 70 ? '#4caf50' : 
                                     helpResponse.progressPercentage > 40 ? '#ff9800' : '#f44336',
                              fontSize: '1.05rem'
                            }}
                          >
                            {helpResponse.progressPercentage}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 12,
                            bgcolor: '#e0e0e0',
                            borderRadius: 6,
                            overflow: 'hidden',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${helpResponse.progressPercentage}%`,
                              height: '100%',
                              background: helpResponse.progressPercentage > 70 
                                ? 'linear-gradient(90deg, #66bb6a 0%, #4caf50 100%)'
                                : helpResponse.progressPercentage > 40
                                ? 'linear-gradient(90deg, #ffa726 0%, #ff9800 100%)'
                                : 'linear-gradient(90deg, #ef5350 0%, #f44336 100%)',
                              transition: 'width 0.5s ease',
                              borderRadius: 6,
                              boxShadow: '0 0 8px rgba(76, 175, 80, 0.4)'
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {/* Detected Issues */}
              {helpResponse.detectedIssues && helpResponse.detectedIssues.length > 0 && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid #f44336'
                  }}
                >
                  <Box 
                    sx={{ 
                      background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                      p: 2,
                      borderBottom: '2px solid #f44336'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#c62828',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      ⚠️ Issues Detected
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                    {helpResponse.detectedIssues.map((issue, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          mb: index === helpResponse.detectedIssues.length - 1 ? 0 : 2,
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          borderLeft: '5px solid #f44336',
                          boxShadow: '0 2px 4px rgba(244, 67, 54, 0.1)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 8px rgba(244, 67, 54, 0.2)'
                          }
                        }}
                      >
                        <Typography 
                          sx={{ 
                            fontSize: '0.95rem', 
                            color: '#d32f2f',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            lineHeight: 1.6
                          }}
                        >
                          <span style={{ 
                            fontWeight: 700, 
                            fontSize: '1.1rem',
                            minWidth: '24px'
                          }}>
                            {index + 1}.
                          </span>
                          <span style={{ flex: 1 }}>{issue}</span>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Next Step Suggestion */}
              {helpResponse.nextStep && !helpResponse.isCorrect && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid #9c27b0'
                  }}
                >
                  <Box 
                    sx={{ 
                      background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                      p: 2,
                      borderBottom: '2px solid #9c27b0'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#6a1b9a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      🎯 Next Step
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                    <Box
                      sx={{
                        p: 2.5,
                        bgcolor: 'white',
                        borderRadius: 2,
                        borderLeft: '5px solid #9c27b0',
                        boxShadow: '0 2px 8px rgba(156, 39, 176, 0.15)'
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1rem',
                          lineHeight: 1.8,
                          color: '#424242',
                          fontWeight: 500
                        }}
                      >
                        {helpResponse.nextStep}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Correct Solution Preview */}
              {helpResponse.correctSolution && !helpResponse.isCorrect && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid #4caf50'
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
                      <CheckCircle />
                      Correct Solution (for this step)
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: '#f1f8e9',
                        borderRadius: 2,
                        border: '1px solid #aed581',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)'
                      }}
                    >
                      <Typography
                        component="pre"
                        sx={{
                          fontFamily: '"Fira Code", "Consolas", "Courier New", monospace',
                          fontSize: '1rem',
                          lineHeight: 2,
                          color: '#1b5e20',
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                          fontWeight: 500
                        }}
                      >
                        {helpResponse.correctSolution}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Hints & Guidance */}
              <Paper 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid #ff9800'
                }}
              >
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                    p: 2,
                    borderBottom: '2px solid #ff9800'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#e65100',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Lightbulb />
                    Hints & Guidance
                  </Typography>
                </Box>
                <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                  {helpResponse.hints && helpResponse.hints.map((hint, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        mb: 2,
                        p: 2.5,
                        bgcolor: 'white',
                        borderRadius: 2,
                        borderLeft: '5px solid #ff9800',
                        boxShadow: '0 2px 6px rgba(255, 152, 0, 0.12)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)'
                        }
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.95rem',
                          lineHeight: 1.8,
                          color: '#424242',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>💡</span>
                        <span style={{ flex: 1 }}>{hint}</span>
                      </Typography>
                    </Box>
                  ))}

                  {helpResponse.mistakes && helpResponse.mistakes.length > 0 && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: '2px dashed #ff9800' }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#d32f2f', 
                          mb: 2,
                          fontSize: '1.05rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                        Common Mistakes to Avoid:
                      </Typography>
                      {helpResponse.mistakes.map((mistake, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            mb: index === helpResponse.mistakes.length - 1 ? 0 : 1.5,
                            p: 2,
                            bgcolor: '#ffebee',
                            borderRadius: 2,
                            borderLeft: '5px solid #f44336',
                            boxShadow: '0 1px 4px rgba(244, 67, 54, 0.1)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Typography 
                            sx={{ 
                              fontSize: '0.9rem', 
                              color: '#c62828',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1,
                              lineHeight: 1.6
                            }}
                          >
                            <span style={{ fontSize: '1.1rem' }}>❌</span>
                            <span style={{ flex: 1 }}>{mistake}</span>
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
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

export default Helper;
