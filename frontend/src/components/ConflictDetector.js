import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  TextField,
  Collapse,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { identifyConflict } from '../services/api';

const ConflictDetector = ({ problem }) => {
  const [conflictType, setConflictType] = useState('');
  const [explanation, setExplanation] = useState('');
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [attemptedTable, setAttemptedTable] = useState(false);

  const grammar = problem.grammar ? JSON.parse(problem.grammar) : [];
  const terminals = problem.terminals ? JSON.parse(problem.terminals) : [];
  const nonTerminals = problem.nonTerminals ? JSON.parse(problem.nonTerminals) : [];
  const hints = problem.hints ? JSON.parse(problem.hints) : [];
  const conflictCells = problem.conflictCells ? JSON.parse(problem.conflictCells) : [];

  // Reset state when problem changes
  useEffect(() => {
    setConflictType('');
    setExplanation('');
    setValidation(null);
    setShowSolution(false);
    setAttempted(false);
    setShowHints(false);
    setAttemptedTable(false);
    setLoading(false);
  }, [problem.id, problem.problemNumber]);

  const handleSubmit = async () => {
    setLoading(true);
    setAttempted(true);
    try {
      const response = await identifyConflict({
        level: problem.level,
        problemNumber: problem.problemNumber,
        conflictType,
        explanation
      });
      setValidation(response);
    } catch (error) {
      console.error('Error identifying conflict:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConflictType('');
    setExplanation('');
    setValidation(null);
    setShowSolution(false);
    setAttempted(false);
    setAttemptedTable(false);
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

  const renderEmptyParseTable = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Try Building the Parse Table:
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setAttemptedTable(!attemptedTable)}
          >
            {attemptedTable ? 'Hide Table' : 'Show Table Framework'}
          </Button>
        </Box>
        
        <Collapse in={attemptedTable}>
          <TableContainer component={Paper}>
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
                    {terminals.map(t => {
                      const hasConflict = conflictCells.some(
                        cell => cell.row === nt && cell.col === t
                      );
                      return (
                        <TableCell
                          key={`${nt}-${t}`}
                          align="center"
                          sx={{
                            bgcolor: hasConflict && showSolution ? '#ffebee' : 'inherit',
                            position: 'relative'
                          }}
                        >
                          {hasConflict && showSolution && (
                            <>
                              <WarningIcon sx={{ color: '#f44336', fontSize: 20 }} />
                              <Typography variant="caption" color="error" display="block">
                                Conflict!
                              </Typography>
                            </>
                          )}
                          {!hasConflict && showSolution && '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {showSolution && conflictCells.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Conflict Cells Detected:
              </Typography>
              {conflictCells.map((cell, idx) => (
                <Box key={idx} sx={{ mt: 1 }}>
                  <Chip label={`T[${cell.row}, ${cell.col}]`} size="small" color="error" sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    {cell.reason}
                  </Typography>
                  {cell.conflicts && Array.isArray(cell.conflicts) && (
                    <Typography variant="caption" display="block" sx={{ ml: 2, mt: 0.5 }}>
                      Conflicting productions: {cell.conflicts.join(', ')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Alert>
          )}
        </Collapse>
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
          <strong>Task:</strong> Try to construct the LL(1) parse table for this grammar. 
          Identify whether there are any conflicts and what type they are.
        </Typography>
      </Alert>

      {renderGrammar()}
      {renderEmptyParseTable()}

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

      {/* Conflict Type Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
              What kind of conflict does this grammar have?
            </FormLabel>
            <RadioGroup
              value={conflictType}
              onChange={(e) => setConflictType(e.target.value)}
            >
              <FormControlLabel
                value="first-first"
                control={<Radio />}
                label="FIRST/FIRST Conflict"
                disabled={showSolution}
              />
              <Typography variant="caption" sx={{ ml: 4, mb: 1, display: 'block', color: 'text.secondary' }}>
                Multiple productions for the same non-terminal have the same terminal in their FIRST sets
              </Typography>
              
              <FormControlLabel
                value="first-follow"
                control={<Radio />}
                label="FIRST/FOLLOW Conflict"
                disabled={showSolution}
              />
              <Typography variant="caption" sx={{ ml: 4, mb: 1, display: 'block', color: 'text.secondary' }}>
                A production's FIRST set intersects with the non-terminal's FOLLOW set (epsilon-related)
              </Typography>
              
              <FormControlLabel
                value="both"
                control={<Radio />}
                label="Both FIRST/FIRST and FIRST/FOLLOW Conflicts"
                disabled={showSolution}
              />
              <Typography variant="caption" sx={{ ml: 4, mb: 1, display: 'block', color: 'text.secondary' }}>
                Grammar has multiple types of conflicts
              </Typography>
              
              <FormControlLabel
                value="none"
                control={<Radio />}
                label="No Conflict - Grammar is LL(1)"
                disabled={showSolution}
              />
              <Typography variant="caption" sx={{ ml: 4, display: 'block', color: 'text.secondary' }}>
                Grammar satisfies all LL(1) conditions
              </Typography>
            </RadioGroup>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Your Explanation (Optional):
            </Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why you chose this answer (e.g., which cells have conflicts, what productions conflict, etc.)"
              disabled={showSolution}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || showSolution || !conflictType}
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
            severity={validation.correct ? 'success' : 'error'}
            icon={validation.correct ? <CheckCircleIcon /> : <WarningIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {validation.correct ? '✓ Correct!' : '✗ Incorrect'}
            </Typography>
            <Typography variant="body2">
              Your answer: <strong>{validation.userAnswer}</strong>
            </Typography>
            {!validation.correct && showSolution && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Correct answer: <strong>{validation.correctAnswer}</strong>
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              {validation.feedback}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Solution Section */}
      {showSolution && validation && (
        <Card sx={{ bgcolor: validation.correct ? '#e8f5e9' : '#fff3e0' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color={validation.correct ? 'success.main' : 'warning.main'}>
              Detailed Explanation
            </Typography>
            <Box dangerouslySetInnerHTML={{ __html: validation.explanation || problem.solution }} />
            
            {problem.learningOutcome && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Learning Outcome:</strong> {problem.learningOutcome}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ConflictDetector;
