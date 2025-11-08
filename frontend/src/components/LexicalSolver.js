// frontend/src/components/LexicalSolver.js
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Divider, Alert, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import algos from '../services/lexicalAlgorithms';
import AutomatonTableEditor from './AutomatonTableEditor';
import { CONVERSION_HIERARCHY, getAvailableEndTypes, getConversionTypeKey } from '../services/lexicalGenerator';

// Render automaton as a table
function AutomatonTable({ automaton, title }) {
  if (!automaton || !automaton.states) return <Typography color="text.secondary">No automaton data</Typography>;
  
  const { states, alphabet, transitions, start, accepts } = automaton;
  
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>{title}</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption"><strong>Start State:</strong> {start}</Typography>
        <Typography variant="caption"><strong>Accept States:</strong> {accepts?.join(', ')}</Typography>
        <Typography variant="caption"><strong>Alphabet:</strong> {alphabet?.join(', ')}</Typography>
      </Box>
      
      <Paper variant="outlined">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#667eea', color: 'white' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>State</th>
              {alphabet?.filter(a => a !== 'ε').map(sym => (
                <th key={sym} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{sym}</th>
              ))}
              {alphabet?.includes('ε') && (
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', backgroundColor: '#764ba2' }}>ε</th>
              )}
            </tr>
          </thead>
          <tbody>
            {states?.map((state, idx) => (
              <tr key={state} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: state === start ? 700 : 400 }}>
                  {state} {accepts?.includes(state) && '(F)'}
                </td>
                {alphabet?.filter(a => a !== 'ε').map(sym => {
                  const target = transitions?.[state]?.[sym];
                  return (
                    <td key={sym} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {Array.isArray(target) ? target.join(', ') : (target || '-')}
                    </td>
                  );
                })}
                {alphabet?.includes('ε') && (
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {Array.isArray(transitions?.[state]?.['ε']) 
                      ? transitions[state]['ε'].join(', ') 
                      : (transitions?.[state]?.['ε'] || '-')}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </Box>
  );
}

function LexicalSolver({ topic }) {
  // For two-dropdown system
  const [startType, setStartType] = useState('RE');
  const [endType, setEndType] = useState('ε-NFA');
  const [conversionType, setConversionType] = useState('thompson');
  
  const [regexInput, setRegexInput] = useState('');
  const [inputAutomaton, setInputAutomaton] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Update conversion type when start/end types change
  React.useEffect(() => {
    const newConversionType = getConversionTypeKey(startType, endType);
    setConversionType(newConversionType);
  }, [startType, endType]);

  const handleSolve = () => {
    setError(null);
    setResult(null);

    try {
      if (conversionType === 'thompson') {
        // RE to ε-NFA
        if (!regexInput || regexInput.trim() === '') {
          setError('Please enter a regular expression.');
          return;
        }
        const enfa = algos.thompsonFromRegex(regexInput.trim());
        setResult({
          type: 'thompson',
          input: regexInput.trim(),
          output: enfa,
          description: 'Thompson Construction generates an ε-NFA from the regular expression.'
        });
      } else if (conversionType === 'epsilon') {
        // ε-NFA to NFA
        if (!inputAutomaton) {
          setError('Please fill in the automaton table.');
          return;
        }
        
        // Check if it has epsilon transitions
        if (!inputAutomaton.alphabet.includes('ε')) {
          setError('Input must be an ε-NFA (alphabet should include ε).');
          return;
        }

        const closures = {};
        for (const s of inputAutomaton.states) {
          closures[s] = algos.epsilonClosure([s], inputAutomaton.transitions);
        }
        
        const nfaAlphabet = inputAutomaton.alphabet.filter(a => a !== 'ε');
        const nfa = { 
          states: [], 
          alphabet: nfaAlphabet, 
          transitions: {}, 
          start: inputAutomaton.start, 
          accepts: inputAutomaton.accepts 
        };
        
        for (const s of inputAutomaton.states) {
          nfa.states.push(s);
          nfa.transitions[s] = {};
          for (const a of nfaAlphabet) {
            const moveSet = algos.move(closures[s], a, inputAutomaton.transitions);
            const closureSet = new Set();
            for (const m of moveSet) {
              algos.epsilonClosure([m], inputAutomaton.transitions).forEach(x => closureSet.add(x));
            }
            if (closureSet.size) nfa.transitions[s][a] = Array.from(closureSet);
          }
        }
        
        setResult({
          type: 'epsilon',
          input: inputAutomaton,
          output: nfa,
          closures: closures,
          description: 'Epsilon Closure eliminates ε-transitions by computing closures for each state.'
        });
      } else if (conversionType === 'subset') {
        // NFA to DFA
        if (!inputAutomaton) {
          setError('Please fill in the automaton table.');
          return;
        }
        
        const dfa = algos.nfaToDfa(inputAutomaton);
        setResult({
          type: 'subset',
          input: inputAutomaton,
          output: dfa,
          description: 'Subset Construction converts NFA to DFA by creating states that represent sets of NFA states.'
        });
      } else if (conversionType === 'minimization') {
        // DFA minimization
        if (!inputAutomaton) {
          setError('Please fill in the automaton table.');
          return;
        }
        
        const minDfa = algos.minimizeDfa(inputAutomaton);
        setResult({
          type: 'minimization',
          input: inputAutomaton,
          output: minDfa,
          description: 'DFA Minimization reduces the number of states by merging equivalent states.'
        });
      } else if (conversionType === 'epsilon-to-dfa') {
        // ε-NFA → DFA (via NFA)
        if (!inputAutomaton) {
          setError('Please fill in the automaton table.');
          return;
        }
        
        const steps = [];
        
        // Step 1: ε-NFA → NFA
        const closures = {};
        for (const s of inputAutomaton.states) {
          closures[s] = algos.epsilonClosure([s], inputAutomaton.transitions);
        }
        const nfaAlphabet = inputAutomaton.alphabet.filter(a => a !== 'ε');
        const nfa = { states: [], alphabet: nfaAlphabet, transitions: {}, start: inputAutomaton.start, accepts: inputAutomaton.accepts };
        for (const s of inputAutomaton.states) {
          nfa.states.push(s);
          nfa.transitions[s] = {};
          for (const a of nfaAlphabet) {
            const moveSet = algos.move(closures[s], a, inputAutomaton.transitions);
            const closureSet = new Set();
            for (const m of moveSet) {
              algos.epsilonClosure([m], inputAutomaton.transitions).forEach(x => closureSet.add(x));
            }
            if (closureSet.size) nfa.transitions[s][a] = Array.from(closureSet);
          }
        }
        steps.push({ name: 'NFA', automaton: nfa });
        
        // Step 2: NFA → DFA
        const dfa = algos.nfaToDfa(nfa);
        steps.push({ name: 'DFA', automaton: dfa });
        
        setResult({
          type: 'multi-step',
          input: inputAutomaton,
          output: dfa,
          steps: steps,
          description: 'ε-NFA → DFA conversion: (1) Eliminate ε-transitions → NFA, (2) Subset construction → DFA.'
        });
      } else if (conversionType === 'nfa-to-min-dfa') {
        // NFA → Min DFA (via DFA)
        if (!inputAutomaton) {
          setError('Please fill in the automaton table.');
          return;
        }
        
        const steps = [];
        
        // Step 1: NFA → DFA
        const dfa = algos.nfaToDfa(inputAutomaton);
        steps.push({ name: 'DFA', automaton: dfa });
        
        // Step 2: DFA → Min DFA
        const minDfa = algos.minimizeDfa(dfa);
        steps.push({ name: 'Min DFA', automaton: minDfa });
        
        setResult({
          type: 'multi-step',
          input: inputAutomaton,
          output: minDfa,
          steps: steps,
          description: 'NFA → Min DFA conversion: (1) Subset construction → DFA, (2) Partition refinement → Min DFA.'
        });
      } else if (conversionType === 're-to-dfa') {
        // RE → DFA (via ε-NFA → NFA → DFA)
        if (!regexInput || regexInput.trim() === '') {
          setError('Please enter a regular expression.');
          return;
        }
        
        const steps = [];
        
        // Step 1: RE → ε-NFA
        const enfa = algos.thompsonFromRegex(regexInput.trim());
        steps.push({ name: 'ε-NFA', automaton: enfa });
        
        // Step 2: ε-NFA → NFA
        const closures = {};
        for (const s of enfa.states) {
          closures[s] = algos.epsilonClosure([s], enfa.transitions);
        }
        const nfaAlphabet = enfa.alphabet.filter(a => a !== 'ε');
        const nfa = { states: [], alphabet: nfaAlphabet, transitions: {}, start: enfa.start, accepts: enfa.accepts };
        for (const s of enfa.states) {
          nfa.states.push(s);
          nfa.transitions[s] = {};
          for (const a of nfaAlphabet) {
            const moveSet = algos.move(closures[s], a, enfa.transitions);
            const closureSet = new Set();
            for (const m of moveSet) {
              algos.epsilonClosure([m], enfa.transitions).forEach(x => closureSet.add(x));
            }
            if (closureSet.size) nfa.transitions[s][a] = Array.from(closureSet);
          }
        }
        steps.push({ name: 'NFA', automaton: nfa });
        
        // Step 3: NFA → DFA
        const dfa = algos.nfaToDfa(nfa);
        steps.push({ name: 'DFA', automaton: dfa });
        
        setResult({
          type: 'multi-step',
          input: regexInput.trim(),
          output: dfa,
          steps: steps,
          description: 'RE → DFA conversion: (1) Thompson construction → ε-NFA, (2) Eliminate ε-transitions → NFA, (3) Subset construction → DFA.'
        });
      } else if (conversionType === 're-to-min-dfa') {
        // RE → Min DFA (via ε-NFA → NFA → DFA → Min DFA)
        if (!regexInput || regexInput.trim() === '') {
          setError('Please enter a regular expression.');
          return;
        }
        
        const steps = [];
        
        // Step 1: RE → ε-NFA
        const enfa = algos.thompsonFromRegex(regexInput.trim());
        steps.push({ name: 'ε-NFA', automaton: enfa });
        
        // Step 2: ε-NFA → NFA
        const closures = {};
        for (const s of enfa.states) {
          closures[s] = algos.epsilonClosure([s], enfa.transitions);
        }
        const nfaAlphabet = enfa.alphabet.filter(a => a !== 'ε');
        const nfa = { states: [], alphabet: nfaAlphabet, transitions: {}, start: enfa.start, accepts: enfa.accepts };
        for (const s of enfa.states) {
          nfa.states.push(s);
          nfa.transitions[s] = {};
          for (const a of nfaAlphabet) {
            const moveSet = algos.move(closures[s], a, enfa.transitions);
            const closureSet = new Set();
            for (const m of moveSet) {
              algos.epsilonClosure([m], enfa.transitions).forEach(x => closureSet.add(x));
            }
            if (closureSet.size) nfa.transitions[s][a] = Array.from(closureSet);
          }
        }
        steps.push({ name: 'NFA', automaton: nfa });
        
        // Step 3: NFA → DFA
        const dfa = algos.nfaToDfa(nfa);
        steps.push({ name: 'DFA', automaton: dfa });
        
        // Step 4: DFA → Min DFA
        const minDfa = algos.minimizeDfa(dfa);
        steps.push({ name: 'Min DFA', automaton: minDfa });
        
        setResult({
          type: 'multi-step',
          input: regexInput.trim(),
          output: minDfa,
          steps: steps,
          description: 'RE → Min DFA conversion: (1) Thompson → ε-NFA, (2) Eliminate ε → NFA, (3) Subset construction → DFA, (4) Minimize → Min DFA.'
        });
      }
    } catch (e) {
      setError(`Error: ${e.message}`);
      console.error(e);
    }
  };

  const handleClear = () => {
    setRegexInput('');
    setInputAutomaton(null);
    setResult(null);
    setError(null);
  };

  const getExpectedAlphabet = () => {
    if (conversionType === 'thompson') return ['a', 'b'];
    if (conversionType === 'epsilon') return ['a', 'b', 'ε'];
    return ['a', 'b'];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Universal Solver
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Enter your own problem and get the solution instantly.
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Two-Dropdown System for Conversion Selection */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Start Type</InputLabel>
              <Select
                value={startType}
                label="Start Type"
                onChange={(e) => {
                  const newStart = e.target.value;
                  setStartType(newStart);
                  // Reset end type if it's no longer valid
                  const availableEnds = getAvailableEndTypes(newStart);
                  if (!availableEnds.includes(endType)) {
                    setEndType(availableEnds[0] || '');
                  }
                  handleClear();
                }}
              >
                {CONVERSION_HIERARCHY.slice(0, -1).map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>End Type</InputLabel>
              <Select
                value={endType}
                label="End Type"
                onChange={(e) => {
                  setEndType(e.target.value);
                  handleClear();
                }}
              >
                {getAvailableEndTypes(startType).map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3, mt: -2 }}>
          Selected Conversion: <strong>{startType} → {endType}</strong>
        </Typography>

        {/* Input Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Input</Typography>
          
          {(conversionType === 'thompson' || conversionType === 're-to-dfa' || conversionType === 're-to-min-dfa') ? (
            // Regex input for Thompson and multi-step RE conversions
            <TextField
              fullWidth
              label="Regular Expression"
              placeholder="e.g., (a|b)*c, a(b|c)*d, etc."
              value={regexInput}
              onChange={(e) => setRegexInput(e.target.value)}
              helperText="Supported operators: | (union), * (star), () (grouping), concatenation (implicit)"
              sx={{ mb: 2 }}
            />
          ) : (
            // Table editor for other conversions
            <>
              <Typography variant="caption" display="block" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Define your automaton by specifying the number of states, alphabet, and transitions below.
                {(conversionType === 'epsilon' || conversionType === 'epsilon-to-dfa') && ' Include ε in the alphabet for epsilon transitions.'}
              </Typography>
              
              <AutomatonTableEditor
                onAutomatonChange={setInputAutomaton}
                expectedAlphabet={getExpectedAlphabet()}
                hasEpsilon={conversionType === 'epsilon' || conversionType === 'epsilon-to-dfa'}
              />
            </>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleSolve}
              sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}
            >
              Solve
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleClear}
              sx={{ borderColor: '#667eea', color: '#667eea' }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Result Section */}
        {result && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              ✅ Solution
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              {result.description}
            </Typography>

            {/* Show Input */}
            {(result.type === 'thompson' || (result.type === 'multi-step' && typeof result.input === 'string')) ? (
              <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5', border: '2px solid #667eea' }}>
                <Typography variant="subtitle2" fontWeight={600}>Input Regular Expression:</Typography>
                <Typography variant="body1" fontFamily="monospace" fontWeight={600} color="#667eea">
                  {result.input}
                </Typography>
              </Paper>
            ) : result.type !== 'multi-step' && (
              <AutomatonTable automaton={result.input} title="Input Automaton" />
            )}

            {/* Multi-step results */}
            {result.type === 'multi-step' && result.steps ? (
              <>
                {result.input && typeof result.input !== 'string' && (
                  <AutomatonTable automaton={result.input} title="Input Automaton" />
                )}
                
                {result.steps.map((step, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#667eea' }}>
                      Step {idx + 1}: {step.name}
                    </Typography>
                    <AutomatonTable automaton={step.automaton} title="" />
                  </Box>
                ))}
                
                <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9', border: '2px solid #4caf50' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Final Result:</Typography>
                  <AutomatonTable automaton={result.output} title="" />
                </Paper>
              </>
            ) : (
              // Single-step result
              <>
                {/* Show Output */}
                <AutomatonTable automaton={result.output} title="Output Automaton" />

                {/* Additional Info for Epsilon Closure */}
                {result.type === 'epsilon' && result.closures && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Epsilon Closures:
                    </Typography>
                    <Grid container spacing={1}>
                      {Object.keys(result.closures).map(state => (
                        <Grid item xs={12} sm={6} md={4} key={state}>
                          <Paper variant="outlined" sx={{ p: 1.5 }}>
                            <Typography variant="caption" fontWeight={600}>
                              ε-closure({state}):
                            </Typography>
                            <Typography variant="caption" display="block">
                              {'{' + result.closures[state].join(', ') + '}'}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default LexicalSolver;
