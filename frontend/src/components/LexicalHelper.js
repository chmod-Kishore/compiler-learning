// frontend/src/components/LexicalHelper.js
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Divider, Alert, FormControl, InputLabel, Select, MenuItem, Grid, Stepper, Step, StepLabel, StepContent } from '@mui/material';
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

function LexicalHelper({ topic }) {
  // For two-dropdown system
  const [startType, setStartType] = useState('RE');
  const [endType, setEndType] = useState('ε-NFA');
  const [conversionType, setConversionType] = useState('thompson');
  
  const [regexInput, setRegexInput] = useState('');
  const [inputAutomaton, setInputAutomaton] = useState(null);
  const [stuckAtStep, setStuckAtStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);

  // Update conversion type when start/end types change
  React.useEffect(() => {
    const newConversionType = getConversionTypeKey(startType, endType);
    setConversionType(newConversionType);
  }, [startType, endType]);

  const getStepOptions = () => {
    switch (conversionType) {
      case 'thompson':
        return [
          'Understanding the regex',
          'Breaking down operators',
          'Building NFA fragments',
          'Connecting fragments',
          'Final ε-NFA'
        ];
      case 'epsilon':
        return [
          'Understanding ε-transitions',
          'Computing ε-closures',
          'Building transition table',
          'Removing ε from alphabet',
          'Final NFA'
        ];
      case 'subset':
        return [
          'Computing start state closure',
          'Building DFA states',
          'Computing transitions',
          'Identifying accept states',
          'Final DFA'
        ];
      case 'minimization':
        return [
          'Removing unreachable states',
          'Initial partitioning',
          'Refining partitions',
          'Merging equivalent states',
          'Final minimized DFA'
        ];
      case 'epsilon-to-dfa':
        return [
          'Understanding the problem',
          'Eliminating ε-transitions (ε-NFA → NFA)',
          'Applying subset construction (NFA → DFA)',
          'Verifying the result',
          'Final DFA'
        ];
      case 'nfa-to-min-dfa':
        return [
          'Understanding the problem',
          'Applying subset construction (NFA → DFA)',
          'Minimizing the DFA',
          'Verifying the result',
          'Final minimized DFA'
        ];
      case 're-to-dfa':
        return [
          'Understanding the regex',
          'Thompson construction (RE → ε-NFA)',
          'Eliminating ε-transitions (ε-NFA → NFA)',
          'Subset construction (NFA → DFA)',
          'Final DFA'
        ];
      case 're-to-min-dfa':
        return [
          'Understanding the regex',
          'Thompson construction (RE → ε-NFA)',
          'Eliminating ε-transitions (ε-NFA → NFA)',
          'Subset construction (NFA → DFA)',
          'Minimizing (DFA → Min DFA)',
          'Final minimized DFA'
        ];
      default:
        return ['Step 1', 'Step 2', 'Step 3'];
    }
  };

  const generateSteps = (input, type) => {
    const stepList = [];

    if (type === 'thompson') {
      const regex = input;
      stepList.push({
        label: 'Understanding the regex',
        content: `Input regular expression: ${regex}`,
        detail: 'We need to convert this regular expression to an ε-NFA using Thompson Construction.'
      });

      stepList.push({
        label: 'Breaking down operators',
        content: 'Identifying operators: | (union), * (star), () (grouping), concatenation',
        detail: 'Thompson Construction handles each operator with specific NFA patterns.'
      });

      stepList.push({
        label: 'Building NFA fragments',
        content: 'Creating fragments for each symbol and operator',
        detail: 'Each basic symbol gets a 2-state NFA. Operators combine fragments.'
      });

      const enfa = algos.thompsonFromRegex(regex);
      
      stepList.push({
        label: 'Connecting fragments',
        content: 'Combining all fragments with ε-transitions',
        automaton: enfa,
        detail: 'Fragments are connected according to operator precedence and associativity.'
      });

      stepList.push({
        label: 'Final ε-NFA',
        content: 'Complete ε-NFA with all transitions',
        automaton: enfa,
        detail: 'The resulting ε-NFA accepts the same language as the regular expression.'
      });

    } else if (type === 'epsilon') {
      const nfa = input;
      
      stepList.push({
        label: 'Understanding ε-transitions',
        content: 'Input ε-NFA has epsilon transitions that need to be eliminated',
        automaton: nfa,
        detail: 'ε-transitions allow moving without consuming input. We need to remove them.'
      });

      const closures = {};
      for (const s of nfa.states) {
        closures[s] = algos.epsilonClosure([s], nfa.transitions);
      }

      stepList.push({
        label: 'Computing ε-closures',
        content: 'For each state, compute which states are reachable via ε-transitions',
        detail: Object.keys(closures).map(s => `ε-closure(${s}) = {${closures[s].join(', ')}}`).join('\n'),
        closures: closures
      });

      const nfaAlphabet = nfa.alphabet.filter(a => a !== 'ε');
      const resultNfa = { 
        states: [], 
        alphabet: nfaAlphabet, 
        transitions: {}, 
        start: nfa.start, 
        accepts: nfa.accepts 
      };
      
      for (const s of nfa.states) {
        resultNfa.states.push(s);
        resultNfa.transitions[s] = {};
        for (const a of nfaAlphabet) {
          const moveSet = algos.move(closures[s], a, nfa.transitions);
          const closureSet = new Set();
          for (const m of moveSet) {
            algos.epsilonClosure([m], nfa.transitions).forEach(x => closureSet.add(x));
          }
          if (closureSet.size) resultNfa.transitions[s][a] = Array.from(closureSet);
        }
      }

      stepList.push({
        label: 'Building transition table',
        content: 'For each state and symbol, compute: ε-closure(move(ε-closure(state), symbol))',
        detail: 'This creates new transitions that incorporate the effect of ε-transitions.',
        automaton: resultNfa
      });

      stepList.push({
        label: 'Removing ε from alphabet',
        content: 'The resulting NFA has no ε-transitions',
        automaton: resultNfa,
        detail: 'Alphabet no longer contains ε symbol.'
      });

      stepList.push({
        label: 'Final NFA',
        content: 'Complete NFA equivalent to the original ε-NFA',
        automaton: resultNfa,
        detail: 'This NFA accepts the same language without using ε-transitions.'
      });

    } else if (type === 'subset') {
      const nfa = input;
      
      stepList.push({
        label: 'Computing start state closure',
        content: 'Start DFA state = ε-closure of NFA start state',
        detail: `ε-closure({${nfa.start}}) = {${algos.epsilonClosure([nfa.start], nfa.transitions).join(', ')}}`,
        automaton: nfa
      });

      stepList.push({
        label: 'Building DFA states',
        content: 'Each DFA state represents a set of NFA states',
        detail: 'Using worklist algorithm: process each unmarked DFA state, compute transitions.'
      });

      const dfa = algos.nfaToDfa(nfa);

      stepList.push({
        label: 'Computing transitions',
        content: 'For each DFA state and symbol, compute destination state',
        automaton: dfa,
        detail: 'Transition from state S on symbol a goes to the union of move(s, a) for all s in S.'
      });

      stepList.push({
        label: 'Identifying accept states',
        content: 'A DFA state is accepting if it contains any NFA accept state',
        automaton: dfa,
        detail: `Accept states: {${dfa.accepts.join(', ')}}`
      });

      stepList.push({
        label: 'Final DFA',
        content: 'Complete DFA equivalent to the NFA',
        automaton: dfa,
        detail: 'The DFA accepts the same language as the NFA, but is deterministic.'
      });

    } else if (type === 'minimization') {
      const dfa = input;

      stepList.push({
        label: 'Removing unreachable states',
        content: 'Identify and remove states not reachable from start state',
        automaton: dfa,
        detail: 'Only reachable states affect the language accepted.'
      });

      stepList.push({
        label: 'Initial partitioning',
        content: 'Partition states into accepting and non-accepting groups',
        detail: 'Initial partition: {Accept states} and {Non-accept states}'
      });

      stepList.push({
        label: 'Refining partitions',
        content: 'Split partitions when states have different behaviors',
        detail: 'For each symbol, check if states in a partition go to different partitions.'
      });

      const minDfa = algos.minimizeDfa(dfa);

      stepList.push({
        label: 'Building minimized DFA',
        content: 'Create new states from final partitions',
        automaton: minDfa,
        detail: 'Each partition becomes a state in the minimized DFA.'
      });

      stepList.push({
        label: 'Final result',
        content: 'Minimized DFA with fewest states',
        automaton: minDfa,
        detail: 'This is the smallest DFA accepting the same language.'
      });
    }

    return stepList;
  };

  const handleGetHelp = () => {
    setError(null);
    setSteps([]);

    try {
      if (conversionType === 'thompson') {
        if (!regexInput || regexInput.trim() === '') {
          setError('Please enter a regular expression.');
          return;
        }
        const generatedSteps = generateSteps(regexInput.trim(), 'thompson');
        setSteps(generatedSteps);
      } else {
        if (!inputAutomaton) {
          setError('Please fill in the automaton table.');
          return;
        }

        if (conversionType === 'epsilon' && !inputAutomaton.alphabet.includes('ε')) {
          setError('Input must be an ε-NFA (alphabet should include ε).');
          return;
        }

        const generatedSteps = generateSteps(inputAutomaton, conversionType);
        setSteps(generatedSteps);
      }
    } catch (e) {
      setError(`Error: ${e.message}`);
      console.error(e);
    }
  };

  const handleClear = () => {
    setRegexInput('');
    setInputAutomaton(null);
    setSteps([]);
    setError(null);
    setStuckAtStep(0);
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
          💡 Step-by-Step Helper
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Get help from a specific step where you're stuck.
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
          <Typography variant="h6" gutterBottom>Input Your Problem</Typography>
          
          {(conversionType === 'thompson' || conversionType === 're-to-dfa' || conversionType === 're-to-min-dfa') ? (
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
        </Box>

        {/* Step Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>I'm stuck at this step</InputLabel>
          <Select
            value={stuckAtStep}
            label="I'm stuck at this step"
            onChange={(e) => setStuckAtStep(e.target.value)}
          >
            {getStepOptions().map((step, idx) => (
              <MenuItem key={idx} value={idx}>{idx + 1}. {step}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleGetHelp}
            sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}
          >
            Get Help from Step {stuckAtStep + 1}
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleClear}
            sx={{ borderColor: '#667eea', color: '#667eea' }}
          >
            Clear
          </Button>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step-by-Step Solution */}
        {steps.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              📚 Step-by-Step Solution (from Step {stuckAtStep + 1})
            </Typography>
            
            <Stepper activeStep={steps.length} orientation="vertical" sx={{ mt: 2 }}>
              {steps.slice(stuckAtStep).map((step, index) => (
                <Step key={index} active={true} completed={true}>
                  <StepLabel>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Step {stuckAtStep + index + 1}: {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        {step.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        {step.detail}
                      </Typography>
                      
                      {step.automaton && (
                        <AutomatonTable automaton={step.automaton} title="Automaton at this step" />
                      )}
                      
                      {step.closures && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                            Epsilon Closures:
                          </Typography>
                          <Grid container spacing={1}>
                            {Object.keys(step.closures).map(state => (
                              <Grid item xs={12} sm={6} md={4} key={state}>
                                <Paper variant="outlined" sx={{ p: 1.5 }}>
                                  <Typography variant="caption" fontWeight={600}>
                                    ε-closure({state}):
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    {'{' + step.closures[state].join(', ') + '}'}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Paper>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default LexicalHelper;
