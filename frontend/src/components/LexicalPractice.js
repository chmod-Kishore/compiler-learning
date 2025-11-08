// frontend/src/components/LexicalPractice.js
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemButton, ListItemText, Button, TextField, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { generateProblemsFor } from '../services/lexicalGenerator';
import algos from '../services/lexicalAlgorithms';
import AutomatonTableEditor from './AutomatonTableEditor';

function prettyJson(obj) {
  try { return JSON.stringify(obj, null, 2); } catch(e) { return String(obj); }
}

// Render automaton as a table
function AutomatonTable({ automaton, title }) {
  if (!automaton || !automaton.states) return <Typography color="text.secondary">No automaton data</Typography>;
  
  const { states, alphabet, transitions, start, accepts } = automaton;
  
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>{title}</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Chip label={`Start: ${start}`} color="primary" size="small" />
        <Chip label={`Accept: ${accepts?.join(', ')}`} color="success" size="small" />
        <Chip label={`Alphabet: ${alphabet?.join(', ')}`} size="small" />
      </Box>
      
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#667eea', color: 'white' }}>State</TableCell>
              {alphabet?.filter(a => a !== 'ε').map(sym => (
                <TableCell key={sym} align="center" sx={{ fontWeight: 700, bgcolor: '#667eea', color: 'white' }}>{sym}</TableCell>
              ))}
              {alphabet?.includes('ε') && (
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#764ba2', color: 'white' }}>ε</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {states?.map(state => (
              <TableRow key={state} sx={{ '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}>
                <TableCell sx={{ fontWeight: state === start ? 700 : 400, bgcolor: state === start ? '#e3f2fd' : 'inherit' }}>
                  {state} {accepts?.includes(state) && '(F)'}
                </TableCell>
                {alphabet?.filter(a => a !== 'ε').map(sym => {
                  const target = transitions?.[state]?.[sym];
                  return (
                    <TableCell key={sym} align="center">
                      {Array.isArray(target) ? target.join(', ') : (target || '-')}
                    </TableCell>
                  );
                })}
                {alphabet?.includes('ε') && (
                  <TableCell align="center">
                    {Array.isArray(transitions?.[state]?.['ε']) 
                      ? transitions[state]['ε'].join(', ') 
                      : (transitions?.[state]?.['ε'] || '-')}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function LexicalPractice({ topic }) {
  const [problems, setProblems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userAutomaton, setUserAutomaton] = useState(null);
  const [result, setResult] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  // For multi-step problems
  const [intermediateAutomata, setIntermediateAutomata] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    const p = generateProblemsFor(topic);
    setProblems(p);
    setSelectedIndex(0);
    setUserAutomaton(null);
    setResult(null);
    setShowAnswer(false);
    setIntermediateAutomata({});
    setCurrentStep(0);
  }, [topic]);

  useEffect(() => {
    setUserAutomaton(null);
    setResult(null);
    setShowAnswer(false);
    setIntermediateAutomata({});
    setCurrentStep(0);
  }, [selectedIndex]);

  if (!problems || problems.length === 0) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="text.secondary">No problems available for this topic</Typography>
    </Box>
  );
  
  const problem = problems[selectedIndex];

  const handleVerify = () => {
    setResult(null);
    setShowAnswer(false);
    
    // Handle miscellaneous multi-step conversions
    if (topic === 'miscellaneous') {
      return handleVerifyMultiStep();
    }
    
    if (!userAutomaton) {
      setResult({ error: 'Please fill in the automaton table before verifying.' });
      return;
    }
    
    try {
      let expected, actual;
      actual = userAutomaton;
      
      if (topic === 'thompson') {
        expected = algos.thompsonFromRegex(problem.input.regex);
        const cmp = algos.compareAutomata(expected, actual);
        setResult({ expected, cmp, steps: [ {title: 'Thompson construction (summary)', data: expected } ] });
      } else if (topic === 'epsilon') {
        const nfaIn = problem.input;
        const closures = {};
        for (const s of nfaIn.states) closures[s] = algos.epsilonClosure([s], nfaIn.transitions);
        // Filter out epsilon from alphabet for the resulting NFA
        const nfaAlphabet = nfaIn.alphabet.filter(a => a !== 'ε');
        const built = { states: [], alphabet: nfaAlphabet, transitions: {}, start: nfaIn.start, accepts: nfaIn.accepts };
        for (const s of nfaIn.states) {
          built.states.push(s);
          built.transitions[s] = {};
          for (const a of nfaAlphabet) {
            const moveSet = algos.move(closures[s], a, nfaIn.transitions);
            const closureSet = new Set();
            for (const m of moveSet) {
              algos.epsilonClosure([m], nfaIn.transitions).forEach(x => closureSet.add(x));
            }
            if (closureSet.size) built.transitions[s][a] = Array.from(closureSet);
          }
        }
        expected = built;
        actual = userAutomaton;
        const cmp = algos.compareAutomata(expected, actual);
        setResult({ expected, cmp, steps: Object.keys(closures).map(k=>({title:`ε-closure(${k})`, data: closures[k]})) });
      } else if (topic === 'subset') {
        const nfa = problem.input;
        const dfa = algos.nfaToDfa(nfa);
        expected = dfa;
        actual = userAutomaton;
        // Use flexible comparison for subset construction (allows different state names)
        const cmp = algos.compareDfaEquivalence(expected, actual);
        const steps = [ { title: 'Start ε-closure', data: algos.epsilonClosure([nfa.start], nfa.transitions) } ];
        setResult({ expected, cmp, steps });
      } else if (topic === 'minimization') {
        const dfa = problem.input;
        const min = algos.minimizeDfa(dfa);
        expected = min;
        actual = userAutomaton;
        // Use flexible comparison for minimization (allows different state names)
        const cmp = algos.compareDfaEquivalence(expected, actual);
        setResult({ expected, cmp, steps: [{ title: 'Initial DFA', data: dfa }, { title: 'Partition Refinement Result', data: min }] });
      }
    } catch (e) {
      setResult({ error: 'Error verifying answer: ' + e.message, rawError: String(e) });
    }
  };

  const handleVerifyMultiStep = () => {
    try {
      const steps = problem.intermediateSteps || [];
      const allSteps = [...steps, 'Final'];
      
      // Check if all steps are filled
      const missingSteps = [];
      for (let i = 0; i < steps.length; i++) {
        if (!intermediateAutomata[steps[i]]) {
          missingSteps.push(steps[i]);
        }
      }
      if (!userAutomaton) missingSteps.push('Final');
      
      if (missingSteps.length > 0) {
        setResult({ error: `Please fill in all steps: ${missingSteps.join(', ')}` });
        return;
      }
      
      // Compute expected results for all steps
      const expectedResults = computeMultiStepAnswer(problem);
      
      // Verify each step
      const stepResults = [];
      let allCorrect = true;
      
      // Verify intermediate steps
      for (let i = 0; i < steps.length; i++) {
        const stepName = steps[i];
        const userStep = intermediateAutomata[stepName];
        const expectedStep = expectedResults[i];
        
        let cmp;
        if (stepName === 'NFA' || stepName === 'ε-NFA') {
          cmp = algos.compareAutomata(expectedStep, userStep);
        } else {
          // DFA or Min DFA - use flexible comparison
          cmp = algos.compareDfaEquivalence(expectedStep, userStep);
        }
        
        stepResults.push({
          stepName,
          correct: cmp.equal,
          expected: expectedStep,
          user: userStep,
          cmp
        });
        
        if (!cmp.equal) allCorrect = false;
      }
      
      // Verify final step
      const finalExpected = expectedResults[expectedResults.length - 1];
      const finalCmp = algos.compareDfaEquivalence(finalExpected, userAutomaton);
      
      stepResults.push({
        stepName: 'Final',
        correct: finalCmp.equal,
        expected: finalExpected,
        user: userAutomaton,
        cmp: finalCmp
      });
      
      if (!finalCmp.equal) allCorrect = false;
      
      setResult({
        multiStep: true,
        allCorrect,
        stepResults,
        steps: allSteps
      });
      
    } catch (e) {
      setResult({ error: 'Error verifying multi-step answer: ' + e.message, rawError: String(e) });
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setResult(null);
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
      {/* Left: Problem List */}
      <Paper elevation={2} sx={{ width: 240, p: 2, height: 'fit-content' }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Problems</Typography>
        <Divider sx={{ mb: 1 }} />
        <List dense>
          {problems.map((p, idx) => (
            <ListItem key={p.id} disablePadding>
              <ListItemButton 
                selected={idx===selectedIndex} 
                onClick={() => setSelectedIndex(idx)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(102, 126, 234, 0.15)',
                    borderLeft: '3px solid #667eea'
                  }
                }}
              >
                <ListItemText 
                  primary={`${idx+1}. ${p.id}`} 
                  secondary={p.note || p.meta} 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Right: Problem Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>{problem.title || problem.id}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>{problem.meta || problem.note || ''}</Typography>
          <Divider sx={{ my: 2 }} />

          {/* Input Display */}
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>Problem Input</Typography>
            {(topic === 'thompson' || (topic === 'miscellaneous' && problem.input.regex)) ? (
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', border: '2px solid #667eea' }}>
                <Typography variant="body1" fontFamily="monospace" fontWeight={600}>
                  Regular Expression: <span style={{ color: '#667eea', fontSize: '1.2rem' }}>{problem.input.regex}</span>
                </Typography>
              </Paper>
            ) : (
              <AutomatonTable automaton={problem.input} title="Input Automaton" />
            )}
            {topic === 'miscellaneous' && problem.description && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e8eaf6', borderRadius: 1, border: '1px solid #5c6bc0' }}>
                <Typography variant="body2" color="#283593" fontWeight={600}>
                  📋 Conversion Path:
                </Typography>
                <Typography variant="body2" color="#283593" sx={{ mt: 0.5 }}>
                  {problem.description}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Answer Input */}
          {topic === 'miscellaneous' ? (
            // Multi-step answer input
            <Box sx={{ my: 2 }}>
              <Typography variant="h6" gutterBottom>Your Answer (Multi-Step)</Typography>
              <Typography variant="caption" display="block" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Complete each intermediate step and the final result.
              </Typography>
              
              {problem.intermediateSteps?.map((stepName, idx) => (
                <Box key={stepName} sx={{ mb: 3, p: 2, bgcolor: '#fafafa', borderRadius: 2, border: '2px solid #9c27b0' }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Step {idx + 1}: {stepName}
                  </Typography>
                  <AutomatonTableEditor
                    onAutomatonChange={(automaton) => {
                      setIntermediateAutomata(prev => ({ ...prev, [stepName]: automaton }));
                    }}
                    expectedAlphabet={getExpectedAlphabet(problem, topic).filter(a => 
                      stepName === 'NFA' ? a !== 'ε' : true
                    )}
                    hasEpsilon={stepName === 'ε-NFA'}
                  />
                </Box>
              ))}
              
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f1f8e9', borderRadius: 2, border: '2px solid #689f38' }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Final Step: {problem.title.split('→')[1]?.trim() || 'Final Result'}
                </Typography>
                <AutomatonTableEditor
                  onAutomatonChange={setUserAutomaton}
                  expectedAlphabet={getExpectedAlphabet(problem, topic).filter(a => a !== 'ε')}
                  hasEpsilon={false}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant="contained" onClick={handleVerify} sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}>
                  Verify All Steps
                </Button>
                <Button variant="outlined" onClick={handleShowAnswer} sx={{ borderColor: '#667eea', color: '#667eea' }}>
                  Show Correct Answer
                </Button>
              </Box>
            </Box>
          ) : (
            // Single-step answer input
            <Box sx={{ my: 2 }}>
              <Typography variant="h6" gutterBottom>Your Answer</Typography>
              <Typography variant="caption" display="block" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Fill in the transition table below with your solution.
              </Typography>
              {topic === 'subset' && (
                <Box sx={{ mt: 1, mb: 2, p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ff9800' }}>
                  <Typography variant="caption" fontWeight={600} color="#e65100" display="block">
                    📝 Note for NFA → DFA Conversion:
                  </Typography>
                  <Typography variant="caption" color="#e65100" display="block" sx={{ mt: 0.5 }}>
                    • DFA state names can represent <strong>sets of NFA states</strong>. For example, "Q0Q1" means the set {'{Q0, Q1}'}.
                  </Typography>
                  <Typography variant="caption" color="#e65100" display="block">
                    • You can name these combined states however you prefer (e.g., Q0, Q1, Q2, etc.), as long as the transitions and accept states are logically correct.
                  </Typography>
                </Box>
              )}
            
            <AutomatonTableEditor 
              onAutomatonChange={setUserAutomaton}
              expectedAlphabet={getExpectedAlphabet(problem, topic)}
              hasEpsilon={topic === 'thompson'}
            />
            
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button variant="contained" onClick={handleVerify} sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}>
                Verify Answer
              </Button>
              <Button variant="outlined" onClick={handleShowAnswer} sx={{ borderColor: '#667eea', color: '#667eea' }}>
                Show Correct Answer
              </Button>
            </Box>
          </Box>
          )}
        </Paper>

        {/* Verification Result */}
        {result && (
          <Paper sx={{ p: 3, mb: 2 }} elevation={2}>
            {result.error ? (
              <Typography color="error">{result.error}</Typography>
            ) : result.multiStep ? (
              // Multi-step verification result
              <>
                <Typography variant="h6" gutterBottom>
                  {result.allCorrect ? '✅ All Steps Correct!' : '❌ Some Steps Incorrect'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {result.stepResults.map((stepResult, idx) => (
                  <Box key={idx} sx={{ mb: 3, p: 2, bgcolor: stepResult.correct ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {stepResult.correct ? '✅' : '❌'} {stepResult.stepName}
                    </Typography>
                    
                    {!stepResult.correct && stepResult.cmp?.details && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="error" fontWeight={600}>Issues Found:</Typography>
                        {stepResult.cmp.details.states?.missing?.length > 0 && (
                          <Typography variant="body2">Missing states: {stepResult.cmp.details.states.missing.join(', ')}</Typography>
                        )}
                        {stepResult.cmp.details.states?.extra?.length > 0 && (
                          <Typography variant="body2">Extra states: {stepResult.cmp.details.states.extra.join(', ')}</Typography>
                        )}
                        {stepResult.cmp.details.accepts?.missing?.length > 0 && (
                          <Typography variant="body2">Missing accept states: {stepResult.cmp.details.accepts.missing.join(', ')}</Typography>
                        )}
                        {stepResult.cmp.details.accepts?.extra?.length > 0 && (
                          <Typography variant="body2">Extra accept states: {stepResult.cmp.details.accepts.extra.join(', ')}</Typography>
                        )}
                      </Box>
                    )}
                    
                    <AutomatonTable automaton={stepResult.expected} title={`Expected ${stepResult.stepName}`} />
                  </Box>
                ))}
              </>
            ) : (
              // Single-step verification result
              <>
                <Typography variant="h6" gutterBottom>
                  {result.cmp && result.cmp.equal ? '✅ Correct Answer!' : '❌ Incorrect Answer'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {!result.cmp.equal && (
                  <>
                    <Typography variant="subtitle2" color="error" gutterBottom>Issues Found:</Typography>
                    {result.cmp.details?.states?.missing?.length > 0 && (
                      <Typography variant="body2">Missing states: {result.cmp.details.states.missing.join(', ')}</Typography>
                    )}
                    {result.cmp.details?.states?.extra?.length > 0 && (
                      <Typography variant="body2">Extra states: {result.cmp.details.states.extra.join(', ')}</Typography>
                    )}
                    {result.cmp.details?.accepts?.missing?.length > 0 && (
                      <Typography variant="body2">Missing accept states: {result.cmp.details.accepts.missing.join(', ')}</Typography>
                    )}
                    {result.cmp.details?.accepts?.extra?.length > 0 && (
                      <Typography variant="body2">Extra accept states: {result.cmp.details.accepts.extra.join(', ')}</Typography>
                    )}
                    <Divider sx={{ my: 2 }} />
                  </>
                )}
                
                <AutomatonTable automaton={result.expected} title="Expected Answer" />
              </>
            )}
          </Paper>
        )}

        {/* Show Answer */}
        {showAnswer && (
          <Paper sx={{ p: 3, mt: 2 }} elevation={2}>
            <Typography variant="h6" gutterBottom>✅ Correct Answer</Typography>
            
            {topic === 'miscellaneous' ? (
              // Multi-step answer display
              <>
                <Divider sx={{ my: 2 }} />
                {computeMultiStepAnswer(problem).map((stepAutomaton, idx) => {
                  const steps = problem.intermediateSteps || [];
                  const stepName = idx < steps.length ? steps[idx] : 'Final Result';
                  return (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#667eea' }}>
                        {idx < steps.length ? `Step ${idx + 1}: ${stepName}` : `Final: ${problem.title.split('→')[1]?.trim() || 'Result'}`}
                      </Typography>
                      <AutomatonTable automaton={stepAutomaton} title="" />
                    </Box>
                  );
                })}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Conversion Path:</Typography>
                  <Typography variant="body2">{problem.description}</Typography>
                </Box>
              </>
            ) : (
              // Single-step answer display
              <>
                {topic === 'subset' && (
                  <Box sx={{ mt: 1, mb: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
                    <Typography variant="caption" fontWeight={600} color="#1565c0" display="block">
                      💡 Understanding DFA State Names:
                    </Typography>
                    <Typography variant="caption" color="#1565c0" display="block" sx={{ mt: 0.5 }}>
                      • State names like "Q0Q1" represent the subset {'{Q0, Q1}'} from the original NFA.
                    </Typography>
                    <Typography variant="caption" color="#1565c0" display="block">
                      • You can use any naming convention (Q0, Q1, Q2, etc.) as long as the automaton behavior is correct.
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                {topic === 'thompson' ? (
                  <AutomatonTable automaton={algos.thompsonFromRegex(problem.input.regex)} title="Thompson Construction Result" />
                ) : (
                  <AutomatonTable automaton={computedAnswerFor(problem, topic)} title="Correct Solution" />
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Algorithm Steps:</Typography>
                  {renderAnswerSteps(problem, topic)}
                </Box>
              </>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}

function getExpectedAlphabet(problem, topic) {
  if (topic === 'thompson') {
    // Extract alphabet from regex (simple heuristic)
    const regex = problem.regex || '';
    const chars = new Set();
    for (const c of regex) {
      if (/[a-zA-Z0-9]/.test(c)) chars.add(c);
    }
    return Array.from(chars).length > 0 ? Array.from(chars) : ['a', 'b'];
  }
  if (topic === 'miscellaneous') {
    if (problem.input.regex) {
      // For RE problems
      const chars = new Set();
      for (const c of problem.input.regex) {
        if (/[a-zA-Z0-9]/.test(c)) chars.add(c);
      }
      return Array.from(chars).length > 0 ? Array.from(chars) : ['a', 'b'];
    }
    return problem.input?.alphabet || ['a', 'b'];
  }
  return problem.input?.alphabet || ['a', 'b'];
}

function computeMultiStepAnswer(problem) {
  const results = [];
  const steps = problem.intermediateSteps || [];
  
  // Determine starting point
  let current;
  if (problem.input.regex) {
    // Starts with regex
    current = algos.thompsonFromRegex(problem.input.regex);
    if (steps.includes('ε-NFA')) {
      results.push(current);
    }
  } else {
    // Starts with automaton
    current = problem.input;
  }
  
  // Process each intermediate step
  for (const step of steps) {
    if (step === 'NFA') {
      // Eliminate epsilon transitions
      const closures = {};
      for (const s of current.states) {
        closures[s] = algos.epsilonClosure([s], current.transitions);
      }
      const nfaAlphabet = current.alphabet.filter(a => a !== 'ε');
      const nfa = {
        states: [],
        alphabet: nfaAlphabet,
        transitions: {},
        start: current.start,
        accepts: current.accepts
      };
      for (const s of current.states) {
        nfa.states.push(s);
        nfa.transitions[s] = {};
        for (const a of nfaAlphabet) {
          const moveSet = algos.move(closures[s], a, current.transitions);
          const closureSet = new Set();
          for (const m of moveSet) {
            algos.epsilonClosure([m], current.transitions).forEach(x => closureSet.add(x));
          }
          if (closureSet.size) nfa.transitions[s][a] = Array.from(closureSet);
        }
      }
      current = nfa;
      results.push(current);
    } else if (step === 'DFA') {
      // Subset construction
      current = algos.nfaToDfa(current);
      results.push(current);
    }
  }
  
  // Add final result if it's minimization
  if (problem.type?.includes('min-dfa')) {
    current = algos.minimizeDfa(current);
  } else if (problem.type?.includes('dfa') && !steps.includes('DFA')) {
    // Final is DFA but not in intermediate steps
    current = algos.nfaToDfa(current);
  }
  
  results.push(current);
  return results;
}

function computedAnswerFor(problem, topic) {
  if (topic === 'thompson') return algos.thompsonFromRegex(problem.regex);
  if (topic === 'epsilon') {
    const closures = {};
    for (const s of problem.input.states) closures[s] = algos.epsilonClosure([s], problem.input.transitions);
    // build NFA without epsilons - filter out 'ε' from alphabet
    const nfaAlphabet = problem.input.alphabet.filter(a => a !== 'ε');
    const built = { states: [], alphabet: nfaAlphabet, transitions: {}, start: problem.input.start, accepts: problem.input.accepts };
    for (const s of problem.input.states) {
      built.states.push(s);
      built.transitions[s] = {};
      for (const a of nfaAlphabet) {
        const moveSet = algos.move(closures[s], a, problem.input.transitions);
        const closureSet = new Set();
        for (const m of moveSet) {
          algos.epsilonClosure([m], problem.input.transitions).forEach(x => closureSet.add(x));
        }
        if (closureSet.size) built.transitions[s][a] = Array.from(closureSet);
      }
    }
    return built;
  }
  if (topic === 'subset') return algos.nfaToDfa(problem.input);
  if (topic === 'minimization') return algos.minimizeDfa(problem.input);
  return {};
}


function renderAnswerSteps(problem, topic) {
  if (topic === 'thompson') {
    const frag = algos.thompsonFromRegex(problem.input.regex);
    return (
      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography fontWeight={700} variant="body2" gutterBottom>Thompson Construction Algorithm:</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          1. Parse the regular expression: <strong>{problem.input.regex}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          2. Break down into tokens and apply operator precedence
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          3. Build NFA fragments for each symbol:
          <br />• Each symbol gets a 2-state fragment with one transition
          <br />• Union (|) creates parallel paths with ε-transitions
          <br />• Star (*) creates a loop with ε-transitions
          <br />• Concatenation connects end of first fragment to start of second
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          4. Combine all fragments using ε-transitions
        </Typography>
        <Typography variant="body2">
          5. Result: ε-NFA with {frag.states.length} states and {frag.accepts.length} accept state(s)
        </Typography>
      </Box>
    );
  }
  if (topic === 'epsilon') {
    const closures = {};
    for (const s of problem.input.states) closures[s] = algos.epsilonClosure([s], problem.input.transitions);
    return (
      <Box>
        {Object.keys(closures).map(k => (
          <Box key={k} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography fontWeight={700} variant="body2">ε-closure({k})</Typography>
            <Typography variant="body2" fontFamily="monospace">{prettyJson(closures[k])}</Typography>
          </Box>
        ))}
      </Box>
    );
  }
  if (topic === 'subset') {
    const dfa = algos.nfaToDfa(problem.input);
    return (
      <Box>
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography fontWeight={700} variant="body2">Start ε-closure</Typography>
          <Typography variant="body2" fontFamily="monospace">
            {prettyJson(algos.epsilonClosure([problem.input.start], problem.input.transitions))}
          </Typography>
        </Box>
        <AutomatonTable automaton={dfa} title="Resulting DFA" />
      </Box>
    );
  }
  if (topic === 'minimization') {
    const min = algos.minimizeDfa(problem.input);
    return (
      <Box>
        <AutomatonTable automaton={problem.input} title="Original DFA" />
        <Box sx={{ my: 2 }} />
        <AutomatonTable automaton={min} title="Minimized DFA" />
      </Box>
    );
  }
  return null;
}

export default LexicalPractice;
