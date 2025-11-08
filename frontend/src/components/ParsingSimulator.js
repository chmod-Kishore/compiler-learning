import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { validateParsingSteps } from '../services/api';

const ParsingSimulator = ({ problem }) => {
  const [steps, setSteps] = useState([
    { step: 1, stack: 'S$', input: '', action: '' }
  ]);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const grammar = problem.grammar ? JSON.parse(problem.grammar) : [];
  const expectedTable = problem.expectedTable ? JSON.parse(problem.expectedTable) : {};
  const hints = problem.hints ? JSON.parse(problem.hints) : [];
  const inputString = problem.inputString || '';
  
  const nonTerminals = useMemo(() => 
    problem.nonTerminals ? JSON.parse(problem.nonTerminals) : [], 
    [problem.nonTerminals]
  );

  // Initialize with first step and reset state when problem changes
  useEffect(() => {
    const startSymbol = nonTerminals[0] || 'S';
    setSteps([{
      step: 1,
      stack: `${startSymbol}$`,
      input: inputString.replace(/\s/g, '') + '$',
      action: ''
    }]);
    // Reset all state when problem changes
    setValidation(null);
    setShowSolution(false);
    setAttempted(false);
    setShowHints(false);
    setLoading(false);
  }, [problem.id, problem.problemNumber, nonTerminals, inputString]);

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, {
      step: steps.length + 1,
      stack: '',
      input: '',
      action: ''
    }]);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      // Renumber steps
      newSteps.forEach((step, i) => {
        step.step = i + 1;
      });
      setSteps(newSteps);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAttempted(true);
    try {
      const submission = {
        level: problem.level,
        problemNumber: problem.problemNumber,
        steps: steps.map(s => ({
          step: s.step,
          stack: s.stack,
          input: s.input,
          action: s.action,
          matched: s.action.toLowerCase().includes('match') || s.action.toLowerCase().includes('accept')
        }))
      };
      const response = await validateParsingSteps(submission);
      setValidation(response);
    } catch (error) {
      console.error('Error validating parsing steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const nonTerminals = problem.nonTerminals ? JSON.parse(problem.nonTerminals) : [];
    const startSymbol = nonTerminals[0] || 'S';
    setSteps([{
      step: 1,
      stack: `${startSymbol}$`,
      input: inputString.replace(/\s/g, '') + '$',
      action: ''
    }]);
    setValidation(null);
    setShowSolution(false);
    setAttempted(false);
  };

  const getStepValidation = (stepNum) => {
    if (!validation || !validation.stepResults) return null;
    return validation.stepResults.find(r => r.stepNumber === stepNum);
  };

  const getRowColor = (stepNum) => {
    const stepVal = getStepValidation(stepNum);
    if (!stepVal) return 'inherit';
    if (stepVal.stackCorrect && stepVal.inputCorrect && stepVal.actionCorrect) {
      return '#e8f5e9';
    }
    return '#ffebee';
  };

  const renderGrammar = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Grammar:
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          {grammar.map((rule, idx) => (
            <Typography key={idx} sx={{ fontFamily: 'monospace', mb: 0.5 }}>
              {rule.lhs} → {rule.rhs.join(' ')}
            </Typography>
          ))}
        </Paper>
      </Box>
    );
  };

  const renderParseTable = () => {
    if (!expectedTable || Object.keys(expectedTable).length === 0) return null;
    
    const terminals = problem.terminals ? JSON.parse(problem.terminals) : [];
    const nonTerminals = problem.nonTerminals ? JSON.parse(problem.nonTerminals) : [];

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Parse Table (Reference):
        </Typography>
        <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>
                  Non-Terminal
                </TableCell>
                {terminals.map(t => (
                  <TableCell key={t} align="center" sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>
                    {t}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {nonTerminals.map(nt => (
                <TableRow key={nt}>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd' }}>{nt}</TableCell>
                  {terminals.map(t => (
                    <TableCell key={`${nt}-${t}`} align="center" sx={{ fontSize: '0.875rem' }}>
                      {expectedTable[nt]?.[t] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {problem.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {problem.description}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Input String:</strong> {inputString} $
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          Simulate the parsing process step by step. Fill in the Stack, Input, and Action for each step.
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'primary.main' }}>
          <strong>💡 Tips:</strong> Type <code>-&gt;</code> for → and <code>#</code> for ε in actions
        </Typography>
      </Alert>

      {renderGrammar()}
      {renderParseTable()}

      {/* Hints Section */}
      {hints.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: '#fff3e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LightbulbIcon sx={{ mr: 1, color: '#ff9800' }} />
                <Typography variant="h6">Hints</Typography>
              </Box>
              <IconButton onClick={() => setShowHints(!showHints)} size="small">
                {showHints ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={showHints}>
              <Box sx={{ mt: 2 }}>
                {hints.map((hint, idx) => (
                  <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                    {idx + 1}. {hint}
                  </Typography>
                ))}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Parsing Steps Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white', width: '60px' }}>
                Step
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>
                Stack
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>
                Input
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>
                Action
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white', width: '80px' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white', width: '60px' }}>
                
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {steps.map((step, index) => {
              const stepVal = getStepValidation(step.step);
              return (
                <TableRow key={index} sx={{ bgcolor: getRowColor(step.step) }}>
                  <TableCell>{step.step}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={step.stack}
                      onChange={(e) => handleStepChange(index, 'stack', e.target.value)}
                      disabled={showSolution}
                      placeholder="e.g., E$"
                      fullWidth
                      error={stepVal && !stepVal.stackCorrect}
                      sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
                    />
                    {stepVal && !stepVal.stackCorrect && showSolution && (
                      <Typography variant="caption" color="success.main">
                        ✓ {stepVal.expectedStack}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={step.input}
                      onChange={(e) => handleStepChange(index, 'input', e.target.value)}
                      disabled={showSolution}
                      placeholder="e.g., id+id$"
                      fullWidth
                      error={stepVal && !stepVal.inputCorrect}
                      sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
                    />
                    {stepVal && !stepVal.inputCorrect && showSolution && (
                      <Typography variant="caption" color="success.main">
                        ✓ {stepVal.expectedInput}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={step.action}
                      onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                      disabled={showSolution}
                      placeholder="e.g., Apply E → TE'"
                      fullWidth
                      error={stepVal && !stepVal.actionCorrect}
                    />
                    {stepVal && !stepVal.actionCorrect && showSolution && (
                      <Typography variant="caption" color="success.main">
                        ✓ {stepVal.expectedAction}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {stepVal && (
                      stepVal.stackCorrect && stepVal.inputCorrect && stepVal.actionCorrect ? (
                        <CheckCircleIcon sx={{ color: '#4caf50' }} />
                      ) : (
                        <CancelIcon sx={{ color: '#f44336' }} />
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {index > 0 && !showSolution && (
                      <IconButton size="small" onClick={() => removeStep(index)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addStep}
        disabled={showSolution}
        sx={{ mb: 3 }}
      >
        Add Step
      </Button>

      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || showSolution}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Submit Answer
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => setShowSolution(true)}
            disabled={!attempted || showSolution}
            startIcon={<VisibilityIcon />}
          >
            Show Solution
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<RefreshIcon />}
          >
            Reset
          </Button>
        </Grid>
      </Grid>

      {/* Validation Feedback */}
      {validation && (
        <Box sx={{ mb: 3 }}>
          <Alert
            severity={validation.allCorrect ? 'success' : 'warning'}
            sx={{ mb: 2 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Score: {validation.correctSteps}/{validation.totalSteps} steps correct ({validation.score.toFixed(1)}%)
            </Typography>
            <Typography variant="body2">
              {validation.feedback}
            </Typography>
          </Alert>

          {!validation.allCorrect && validation.stepResults && (
            <Card sx={{ bgcolor: '#fafafa' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Step-by-Step Feedback:
                </Typography>
                {validation.stepResults.map((result, idx) => {
                  const hasError = !result.stackCorrect || !result.inputCorrect || !result.actionCorrect;
                  if (hasError) {
                    return (
                      <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: '#fff', borderRadius: 1, border: '1px solid #ddd' }}>
                        <Chip label={`Step ${result.stepNumber}`} size="small" color="error" sx={{ mb: 1 }} />
                        
                        {!result.stackCorrect && (
                          <Typography variant="body2" color="error">
                            ❌ Stack: "{result.userStack || '(empty)'}"
                            {showSolution && (
                              <Typography component="span" color="success.main" sx={{ ml: 2 }}>
                                ✓ Expected: "{result.expectedStack}"
                              </Typography>
                            )}
                          </Typography>
                        )}
                        
                        {!result.inputCorrect && (
                          <Typography variant="body2" color="error">
                            ❌ Input: "{result.userInput || '(empty)'}"
                            {showSolution && (
                              <Typography component="span" color="success.main" sx={{ ml: 2 }}>
                                ✓ Expected: "{result.expectedInput}"
                              </Typography>
                            )}
                          </Typography>
                        )}
                        
                        {!result.actionCorrect && (
                          <Typography variant="body2" color="error">
                            ❌ Action: "{result.userAction || '(empty)'}"
                            {showSolution && (
                              <Typography component="span" color="success.main" sx={{ ml: 2 }}>
                                ✓ Expected: "{result.expectedAction}"
                              </Typography>
                            )}
                          </Typography>
                        )}
                        
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                          💡 {result.hint}
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                })}
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Solution Section */}
      {showSolution && problem.solution && (
        <Card sx={{ bgcolor: '#e8f5e9' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              Solution Explanation
            </Typography>
            <Box dangerouslySetInnerHTML={{ __html: problem.solution }} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ParsingSimulator;
