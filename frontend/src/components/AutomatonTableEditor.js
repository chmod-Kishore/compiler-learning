// frontend/src/components/AutomatonTableEditor.js
import React, { useState, useEffect } from 'react';
import { Box, TextField, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';

function AutomatonTableEditor({ onAutomatonChange, expectedAlphabet, hasEpsilon }) {
  const [numStates, setNumStates] = useState(2);
  const [states, setStates] = useState(['Q0', 'Q1']);
  const [alphabet, setAlphabet] = useState(expectedAlphabet || ['a', 'b']);
  const [startState, setStartState] = useState('Q0');
  const [acceptStates, setAcceptStates] = useState('Q1');
  const [transitions, setTransitions] = useState({});
  const [alphabetInput, setAlphabetInput] = useState((expectedAlphabet || ['a', 'b']).join(', '));

  // Initialize transitions when states or alphabet change
  useEffect(() => {
    const newTrans = {};
    states.forEach(state => {
      newTrans[state] = {};
      alphabet.forEach(sym => {
        newTrans[state][sym] = transitions[state]?.[sym] || '';
      });
      if (hasEpsilon) {
        newTrans[state]['ε'] = transitions[state]?.['ε'] || '';
      }
    });
    setTransitions(newTrans);
  }, [states, alphabet, hasEpsilon]);

  // Notify parent whenever automaton data changes
  useEffect(() => {
    const automaton = buildAutomaton();
    onAutomatonChange(automaton);
  }, [transitions, startState, acceptStates]);

  const handleNumStatesChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    if (num < 1 || num > 20) return;
    setNumStates(num);
    const newStates = Array.from({ length: num }, (_, i) => `Q${i}`);
    setStates(newStates);
  };

  const handleAlphabetChange = (e) => {
    const input = e.target.value;
    setAlphabetInput(input);
    const symbols = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setAlphabet(symbols);
  };

  const handleTransitionChange = (state, sym, value) => {
    setTransitions(prev => ({
      ...prev,
      [state]: {
        ...prev[state],
        [sym]: value
      }
    }));
  };

  const buildAutomaton = () => {
    const trans = {};
    states.forEach(state => {
      trans[state] = {};
      alphabet.forEach(sym => {
        const val = transitions[state]?.[sym]?.trim();
        if (val) {
          // Support multiple targets separated by comma
          const targets = val.split(',').map(t => t.trim()).filter(t => t);
          trans[state][sym] = targets.length === 1 ? targets[0] : targets;
        }
      });
      if (hasEpsilon) {
        const epsVal = transitions[state]?.['ε']?.trim();
        if (epsVal) {
          const targets = epsVal.split(',').map(t => t.trim()).filter(t => t);
          trans[state]['ε'] = targets.length === 1 ? targets[0] : targets;
        }
      }
    });

    const accepts = acceptStates.split(',').map(s => s.trim()).filter(s => s);
    
    return {
      states,
      alphabet: hasEpsilon ? [...alphabet, 'ε'] : alphabet,
      transitions: trans,
      start: startState.trim(),
      accepts
    };
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Number of States"
            type="number"
            value={numStates}
            onChange={handleNumStatesChange}
            size="small"
            fullWidth
            inputProps={{ min: 1, max: 20 }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Alphabet (comma-separated)"
            value={alphabetInput}
            onChange={handleAlphabetChange}
            size="small"
            fullWidth
            placeholder="a, b, c"
          />
        </Grid>
        <Grid item xs={12} sm={2.5}>
          <TextField
            label="Start State"
            value={startState}
            onChange={(e) => setStartState(e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2.5}>
          <TextField
            label="Accept States"
            value={acceptStates}
            onChange={(e) => setAcceptStates(e.target.value)}
            size="small"
            fullWidth
            placeholder="q1, q2"
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
        Transition Table (Enter target states, use comma for multiple: q1,q2)
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#667eea', color: 'white', minWidth: 80 }}>State</TableCell>
              {alphabet.map(sym => (
                <TableCell key={sym} align="center" sx={{ fontWeight: 700, bgcolor: '#667eea', color: 'white', minWidth: 100 }}>
                  {sym}
                </TableCell>
              ))}
              {hasEpsilon && (
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#764ba2', color: 'white', minWidth: 100 }}>
                  ε
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {states.map((state, idx) => (
              <TableRow key={state} sx={{ '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}>
                <TableCell sx={{ fontWeight: state === startState ? 700 : 400 }}>
                  {state}
                  {acceptStates.split(',').map(s => s.trim()).includes(state) && ' (F)'}
                </TableCell>
                {alphabet.map(sym => (
                  <TableCell key={sym} align="center" sx={{ p: 0.5 }}>
                    <TextField
                      value={transitions[state]?.[sym] || ''}
                      onChange={(e) => handleTransitionChange(state, sym, e.target.value)}
                      size="small"
                      placeholder="-"
                      sx={{ width: '100%' }}
                      inputProps={{ style: { textAlign: 'center', fontSize: '0.85rem' } }}
                    />
                  </TableCell>
                ))}
                {hasEpsilon && (
                  <TableCell align="center" sx={{ p: 0.5 }}>
                    <TextField
                      value={transitions[state]?.['ε'] || ''}
                      onChange={(e) => handleTransitionChange(state, 'ε', e.target.value)}
                      size="small"
                      placeholder="-"
                      sx={{ width: '100%' }}
                      inputProps={{ style: { textAlign: 'center', fontSize: '0.85rem' } }}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          States are auto-generated as q0, q1, q2, etc. Enter transitions in cells (use comma for multiple targets, e.g., "q1,q2").
        </Typography>
      </Box>
    </Box>
  );
}

export default AutomatonTableEditor;
