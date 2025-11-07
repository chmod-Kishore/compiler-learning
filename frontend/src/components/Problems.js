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
import { getProblems, verifyAnswer, getLeftFactoringProblems, verifyLeftFactoringAnswer, getFirstFollowProblems, checkFirstFollowAnswer } from '../services/api';

function Problems({ topic = 'left-recursion' }) {
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // FIRST/FOLLOW specific state (only used when topic === 'first-follow')
  const [nonTerminals, setNonTerminals] = useState([]);
  const [firstAnswers, setFirstAnswers] = useState({});
  const [followAnswers, setFollowAnswers] = useState({});
  const [ffResult, setFfResult] = useState(null);

  const extractNonTerminals = (grammarText) => {
    if (!grammarText) return [];
    const nts = [];
    const seen = new Set();
    grammarText.split(/\r?\n/).forEach(line => {
      const parts = line.split(/->|→/);
      if (parts.length >= 2) {
        const lhs = parts[0].trim();
        if (lhs && !seen.has(lhs)) {
          seen.add(lhs);
          nts.push(lhs);
        }
      }
    });
    return nts;
  };

  const initFirstFollowState = (grammarText) => {
    const nts = extractNonTerminals(grammarText);
    setNonTerminals(nts);
    const initFirst = {}; const initFollow = {};
    nts.forEach(nt => { initFirst[nt] = ''; initFollow[nt] = ''; });
    setFirstAnswers(initFirst);
    setFollowAnswers(initFollow);
    setFfResult(null);
  };

  const loadProblems = async () => {
    try {
      // Fetch problems based on topic
      let data;
      if (topic === 'left-factoring') {
        data = await getLeftFactoringProblems();
      } else if (topic === 'first-follow') {
        data = await getFirstFollowProblems();
      } else {
        data = await getProblems();
      }
      setProblems(data);
      if (topic === 'first-follow' && data && data.length > 0) {
        initFirstFollowState(data[0].question);
      }
    } catch (err) {
      console.error('Error loading problems:', err);
      setSnackbar({ open: true, message: 'Error loading problems', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  // Reinitialize FIRST/FOLLOW input boxes when problem changes
  useEffect(() => {
    if (topic === 'first-follow' && currentProblem) {
      initFirstFollowState(currentProblem.question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, topic]);

  const handleVerify = async () => {
    // FIRST/FOLLOW branch
    if (topic === 'first-follow') {
      setVerifying(true);
      try {
        const request = {
          grammar: currentProblem.question,
          firstSets: firstAnswers,
          followSets: followAnswers
        };
        const result = await checkFirstFollowAnswer(request);
        setFfResult(result);
        setSnackbar({ open: true, message: result.correct ? 'All sets correct! 🎉' : 'Review feedback below.', severity: result.correct ? 'success' : 'info' });
        setShowExplanation(true);
        setExplanation(currentProblem.explanation || '');
      } catch (err) {
        console.error('Error checking FIRST/FOLLOW:', err);
        setSnackbar({ open: true, message: 'Error verifying sets', severity: 'error' });
      } finally {
        setVerifying(false);
      }
      return;
    }

    // Existing grammar transformation branches
    if (!userAnswer.trim()) {
      setSnackbar({ open: true, message: 'Please enter an answer', severity: 'warning' });
      return;
    }
    setVerifying(true);
    try {
      const result = topic === 'left-factoring'
        ? await verifyLeftFactoringAnswer(currentProblem.id, userAnswer.trim())
        : await verifyAnswer(currentProblem.id, userAnswer.trim());

      if (result.correct) {
        setSnackbar({ open: true, message: '✓ Correct!', severity: 'success' });
        setShowExplanation(false);
        setUserAnswer('');
        if (currentIndex < problems.length - 1) {
          setTimeout(() => handleNext(), 1500);
        }
      } else {
        setSnackbar({ open: true, message: '✗ Incorrect', severity: 'error' });
        setShowExplanation(true);
        setExplanation(result.explanation || '');
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
      setFfResult(null);
      // Reset first-follow state will be handled by useEffect watching currentIndex
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer('');
      setShowExplanation(false);
      setFfResult(null);
      // Reset first-follow state will be handled by useEffect watching currentIndex
    }
  };

  // Format explanation text for better readability
  const formatExplanationText = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    const formattedSections = [];
    let currentSection = { type: 'text', content: [] };
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Section headers (Problem-XX, Solution, First Functions, Follow Functions)
      if (trimmed.match(/^(Problem-\d+:|Solution-|First Functions-|Follow Functions-)$/i)) {
        if (currentSection.content.length > 0) {
          formattedSections.push(currentSection);
        }
        formattedSections.push({ type: 'header', content: trimmed });
        currentSection = { type: 'text', content: [] };
      }
      // Grammar productions (contains -> or →)
      else if (trimmed.match(/^[A-Z][A-Za-z0-9']*\s*(->|→)/)) {
        if (currentSection.type !== 'grammar') {
          if (currentSection.content.length > 0) {
            formattedSections.push(currentSection);
          }
          currentSection = { type: 'grammar', content: [] };
        }
        currentSection.content.push(trimmed);
      }
      // Set notation lines (First(X) = { ... } or Follow(X) = { ... })
      else if (trimmed.match(/(First|Follow)\([A-Z]/i)) {
        if (currentSection.type !== 'sets') {
          if (currentSection.content.length > 0) {
            formattedSections.push(currentSection);
          }
          currentSection = { type: 'sets', content: [] };
        }
        currentSection.content.push(trimmed);
      }
      // Empty lines
      else if (trimmed === '') {
        if (currentSection.content.length > 0) {
          formattedSections.push(currentSection);
          currentSection = { type: 'text', content: [] };
        }
      }
      // Regular text
      else {
        if (currentSection.type !== 'text') {
          if (currentSection.content.length > 0) {
            formattedSections.push(currentSection);
          }
          currentSection = { type: 'text', content: [] };
        }
        currentSection.content.push(trimmed);
      }
    });
    
    if (currentSection.content.length > 0) {
      formattedSections.push(currentSection);
    }
    
    return formattedSections;
  };

  const renderFormattedExplanation = (text) => {
    const sections = formatExplanationText(text);
    
    return sections.map((section, idx) => {
      if (section.type === 'header') {
        return (
          <Typography 
            key={idx}
            variant="h6"
            sx={{ 
              fontWeight: 700,
              color: '#1565c0',
              mb: 1.5,
              mt: idx > 0 ? 2.5 : 0,
              fontSize: '1.1rem'
            }}
          >
            {section.content}
          </Typography>
        );
      }
      
      if (section.type === 'grammar') {
        return (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderLeft: '4px solid #2196f3',
              borderRadius: 1
            }}
          >
            {section.content.map((line, lineIdx) => (
              <Typography
                key={lineIdx}
                sx={{
                  fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                  fontSize: '0.95rem',
                  color: '#424242',
                  lineHeight: 1.8
                }}
              >
                {line}
              </Typography>
            ))}
          </Paper>
        );
      }
      
      if (section.type === 'sets') {
        return (
          <Box key={idx} sx={{ mb: 2 }}>
            {section.content.map((line, lineIdx) => (
              <Typography
                key={lineIdx}
                sx={{
                  fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                  fontSize: '0.9rem',
                  color: '#2e7d32',
                  lineHeight: 1.9,
                  pl: 2,
                  py: 0.3,
                  bgcolor: lineIdx % 2 === 0 ? '#f1f8f4' : 'transparent',
                  borderRadius: 0.5
                }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        );
      }
      
      // Regular text
      return (
        <Typography
          key={idx}
          sx={{
            fontSize: '0.95rem',
            color: '#424242',
            lineHeight: 1.7,
            mb: 1.5
          }}
        >
          {section.content.join(' ')}
        </Typography>
      );
    });
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

          {topic !== 'first-follow' && (
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
          />)}
          {topic === 'first-follow' && (
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: '#374151' }}>
                Enter your FIRST and FOLLOW sets (comma-separated)
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', mb: 1.5, display: 'block' }}>
                💡 Tip: Use <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>#</code> for epsilon (ε)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {nonTerminals.map(nt => (
                  <Paper key={nt} elevation={0} sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 2, bgcolor: '#ffffff' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>Non-terminal: {nt}</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField
                        fullWidth size="small" label={`FIRST(${nt})`} placeholder="a, b, # (for ε)"
                        value={firstAnswers[nt] || ''}
                        onChange={(e) => setFirstAnswers({ ...firstAnswers, [nt]: e.target.value })}
                      />
                      <TextField
                        fullWidth size="small" label={`FOLLOW(${nt})`} placeholder="$, ), a"
                        value={followAnswers[nt] || ''}
                        onChange={(e) => setFollowAnswers({ ...followAnswers, [nt]: e.target.value })}
                      />
                    </Box>
                    {ffResult && (
                      <Box sx={{ mt: 1.25 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{ffResult.firstFeedback?.[nt]?.emoji || ''}</span>
                          FIRST: {ffResult.firstFeedback?.[nt]?.correct ? 'Correct' : 'Check'}
                        </Typography>
                        {!ffResult.firstFeedback?.[nt]?.correct && (
                          <Typography variant="caption" color="text.secondary">
                            Missing: {(ffResult.firstFeedback?.[nt]?.missing || []).join(', ') || '-'} | Extra: {(ffResult.firstFeedback?.[nt]?.extra || []).join(', ') || '-'}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <span>{ffResult.followFeedback?.[nt]?.emoji || ''}</span>
                          FOLLOW: {ffResult.followFeedback?.[nt]?.correct ? 'Correct' : 'Check'}
                        </Typography>
                        {!ffResult.followFeedback?.[nt]?.correct && (
                          <Typography variant="caption" color="text.secondary">
                            Missing: {(ffResult.followFeedback?.[nt]?.missing || []).join(', ') || '-'} | Extra: {(ffResult.followFeedback?.[nt]?.extra || []).join(', ') || '-'}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            </Paper>
          )}

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
              {verifying ? 'Verifying...' : (topic === 'first-follow' ? 'Check FIRST & FOLLOW' : 'Verify Answer')}
            </Button>
          </Box>

          {topic !== 'first-follow' && showExplanation && (
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
            </Paper>
          )}
          {topic === 'first-follow' && showExplanation && (
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
                {renderFormattedExplanation(explanation)}
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