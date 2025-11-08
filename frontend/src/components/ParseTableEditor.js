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
  Chip,
  Grid,
  Card,
  CardContent,
  Collapse,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { validateParseTable } from '../services/api';

const ParseTableEditor = ({ problem }) => {
  const [userTable, setUserTable] = useState({});
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const terminals = useMemo(() => 
    problem.terminals ? JSON.parse(problem.terminals) : [], 
    [problem.terminals]
  );
  const nonTerminals = useMemo(() => 
    problem.nonTerminals ? JSON.parse(problem.nonTerminals) : [], 
    [problem.nonTerminals]
  );
  const grammar = problem.grammar ? JSON.parse(problem.grammar) : [];
  const hints = problem.hints ? JSON.parse(problem.hints) : [];

  // Initialize empty user table and reset state when problem changes
  useEffect(() => {
    const initialTable = {};
    nonTerminals.forEach(nt => {
      initialTable[nt] = {};
      terminals.forEach(t => {
        initialTable[nt][t] = '';
      });
    });
    setUserTable(initialTable);
    // Reset all state when problem changes
    setValidation(null);
    setShowSolution(false);
    setAttempted(false);
    setShowHints(false);
  }, [problem.id, problem.problemNumber, nonTerminals, terminals]);

  const handleCellChange = (nonTerminal, terminal, value) => {
    setUserTable(prev => ({
      ...prev,
      [nonTerminal]: {
        ...prev[nonTerminal],
        [terminal]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAttempted(true);
    try {
      const response = await validateParseTable({
        level: problem.level,
        problemNumber: problem.problemNumber,
        userTable
      });
      setValidation(response);
    } catch (error) {
      console.error('Error validating parse table:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const resetTable = {};
    nonTerminals.forEach(nt => {
      resetTable[nt] = {};
      terminals.forEach(t => {
        resetTable[nt][t] = '';
      });
    });
    setUserTable(resetTable);
    setValidation(null);
    setShowSolution(false);
    setAttempted(false);
  };

  const getCellStatus = (nonTerminal, terminal) => {
    if (!validation || !validation.cellResults) return null;
    return validation.cellResults[nonTerminal]?.[terminal];
  };

  const getCellColor = (nonTerminal, terminal) => {
    const status = getCellStatus(nonTerminal, terminal);
    if (!status) return 'inherit';
    return status.correct ? '#e8f5e9' : '#ffebee';
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {problem.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {problem.description}
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>💡 Tips:</strong>
        </Typography>
        <Typography variant="caption" display="block">
          • Type <code>-&gt;</code> for the arrow (→). Example: <code>S -&gt; aA</code>
        </Typography>
        <Typography variant="caption" display="block">
          • Type <code>#</code> for epsilon (ε). Example: <code>A -&gt; #</code> or <code>A -&gt; bA | #</code>
        </Typography>
      </Alert>

      {renderGrammar()}

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

      {/* Parse Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>
                Non-Terminal
              </TableCell>
              {terminals.map(terminal => (
                <TableCell
                  key={terminal}
                  align="center"
                  sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}
                >
                  {terminal}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {nonTerminals.map(nonTerminal => (
              <TableRow key={nonTerminal}>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd' }}>
                  {nonTerminal}
                </TableCell>
                {terminals.map(terminal => {
                  const cellStatus = getCellStatus(nonTerminal, terminal);
                  return (
                    <TableCell
                      key={`${nonTerminal}-${terminal}`}
                      sx={{
                        bgcolor: getCellColor(nonTerminal, terminal),
                        position: 'relative',
                        padding: '4px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          value={userTable[nonTerminal]?.[terminal] || ''}
                          onChange={(e) => handleCellChange(nonTerminal, terminal, e.target.value)}
                          disabled={showSolution}
                          placeholder="-"
                          sx={{
                            '& .MuiInputBase-input': {
                              fontSize: '0.875rem',
                              padding: '6px 8px'
                            }
                          }}
                          fullWidth
                        />
                        {cellStatus && (
                          cellStatus.correct ? (
                            <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                          ) : (
                            <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />
                          )
                        )}
                      </Box>
                      {cellStatus && !cellStatus.correct && showSolution && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            color: '#2e7d32',
                            fontWeight: 'bold'
                          }}
                        >
                          ✓ {cellStatus.correctAnswer}
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
              Score: {validation.correctCells}/{validation.totalCells} cells correct ({validation.score.toFixed(1)}%)
            </Typography>
            <Typography variant="body2">
              {validation.feedback}
            </Typography>
          </Alert>

          {!validation.allCorrect && (
            <Card sx={{ bgcolor: '#fafafa' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cell-by-Cell Feedback:
                </Typography>
                {Object.entries(validation.cellResults).map(([nt, terminalResults]) =>
                  Object.entries(terminalResults).map(([term, result]) => {
                    if (!result.correct) {
                      return (
                        <Box key={`${nt}-${term}`} sx={{ mb: 1 }}>
                          <Chip
                            label={`T[${nt}, ${term}]`}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" component="span" color="error">
                            Your answer: "{result.userAnswer || '(empty)'}"
                          </Typography>
                          {showSolution && (
                            <Typography variant="body2" component="span" color="success.main" sx={{ ml: 2 }}>
                              ✓ Correct: "{result.correctAnswer}"
                            </Typography>
                          )}
                          <Typography variant="caption" display="block" sx={{ ml: 4, color: 'text.secondary' }}>
                            💡 {result.hint}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  })
                )}
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

export default ParseTableEditor;
