// src/components/FirstFollow.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow,
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  HelpOutline
} from '@mui/icons-material';
import { 
  getTheory, 
  getFirstFollowProblems, 
  generateFirstFollow,
  checkFirstFollowAnswer 
} from '../services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: 24 }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function FirstFollow() {
  const [currentTab, setCurrentTab] = useState(0);
  const [theory, setTheory] = useState('');
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Solver state
  const [solverGrammar, setSolverGrammar] = useState('');
  const [solverResult, setSolverResult] = useState(null);

  // Problems state
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [userFirstSets, setUserFirstSets] = useState({});
  const [userFollowSets, setUserFollowSets] = useState({});

  // Helper state
  const [helperGrammar, setHelperGrammar] = useState('');
  const [helperFirstSets, setHelperFirstSets] = useState({});
  const [helperFollowSets, setHelperFollowSets] = useState({});
  const [helperFeedback, setHelperFeedback] = useState(null);

  useEffect(() => {
    loadTheory();
    loadProblems();
  }, []);

  const loadTheory = async () => {
    try {
      const data = await getTheory('first-follow');
      setTheory(data.content);
    } catch (error) {
      console.error('Error loading theory:', error);
    }
  };

  const loadProblems = async () => {
    try {
      const data = await getFirstFollowProblems();
      setProblems(data);
    } catch (error) {
      console.error('Error loading problems:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Solver Tab Functions
  const handleSolverGenerate = async () => {
    if (!solverGrammar.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await generateFirstFollow(solverGrammar);
      setSolverResult(result);
    } catch (error) {
      console.error('Error generating FIRST/FOLLOW:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSolverReset = () => {
    setSolverGrammar('');
    setSolverResult(null);
  };

  // Problems Tab Functions
  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    // Extract non-terminals from the problem
    const nonTerminals = extractNonTerminals(problem.question);
    const initialFirstSets = {};
    const initialFollowSets = {};
    nonTerminals.forEach(nt => {
      initialFirstSets[nt] = '';
      initialFollowSets[nt] = '';
    });
    setUserFirstSets(initialFirstSets);
    setUserFollowSets(initialFollowSets);
  };

  const extractNonTerminals = (grammar) => {
    const lines = grammar.split('\n');
    const nts = new Set();
    lines.forEach(line => {
      const match = line.match(/^([A-Z]'*)/);
      if (match) {
        nts.add(match[1]);
      }
    });
    return Array.from(nts);
  };

  const handleUserFirstChange = (nt, value) => {
    setUserFirstSets({ ...userFirstSets, [nt]: value });
  };

  const handleUserFollowChange = (nt, value) => {
    setUserFollowSets({ ...userFollowSets, [nt]: value });
  };

  // Helper Tab Functions
  const handleHelperCheck = async () => {
    if (!helperGrammar.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await checkFirstFollowAnswer({
        grammar: helperGrammar,
        firstSets: helperFirstSets,
        followSets: helperFollowSets
      });
      setHelperFeedback(result);
    } catch (error) {
      console.error('Error checking answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelperReset = () => {
    setHelperGrammar('');
    setHelperFirstSets({});
    setHelperFollowSets({});
    setHelperFeedback(null);
  };

  const handleHelperGrammarChange = (grammar) => {
    setHelperGrammar(grammar);
    // Auto-detect non-terminals and create input fields
    const nonTerminals = extractNonTerminals(grammar);
    const newFirstSets = {};
    const newFollowSets = {};
    nonTerminals.forEach(nt => {
      newFirstSets[nt] = helperFirstSets[nt] || '';
      newFollowSets[nt] = helperFollowSets[nt] || '';
    });
    setHelperFirstSets(newFirstSets);
    setHelperFollowSets(newFollowSets);
  };

  const renderTheoryTab = () => (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <div dangerouslySetInnerHTML={{ __html: theory }} />
      </CardContent>
    </Card>
  );

  const renderProblemsTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                📝 Practice Problems
              </Typography>
              {problems.map((problem, index) => (
                <Button
                  key={problem.id}
                  fullWidth
                  variant={selectedProblem?.id === problem.id ? "contained" : "outlined"}
                  onClick={() => handleProblemSelect(problem)}
                  sx={{ mb: 1, justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  Problem {index + 1}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          {selectedProblem ? (
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Grammar:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 3 }}>
                  <pre style={{ margin: 0, fontFamily: 'monospace' }}>
                    {selectedProblem.question}
                  </pre>
                </Paper>

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Enter your answers:
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                  FIRST Sets:
                </Typography>
                {Object.keys(userFirstSets).map(nt => (
                  <Box key={`first-${nt}`} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={`FIRST(${nt})`}
                      value={userFirstSets[nt]}
                      onChange={(e) => handleUserFirstChange(nt, e.target.value)}
                      placeholder="e.g., {a, b, ε}"
                      helperText="Enter as comma-separated values"
                    />
                  </Box>
                ))}

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" sx={{ mb: 1, color: 'secondary.main' }}>
                  FOLLOW Sets:
                </Typography>
                {Object.keys(userFollowSets).map(nt => (
                  <Box key={`follow-${nt}`} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={`FOLLOW(${nt})`}
                      value={userFollowSets[nt]}
                      onChange={(e) => handleUserFollowChange(nt, e.target.value)}
                      placeholder="e.g., {$, )}"
                      helperText="Enter as comma-separated values"
                    />
                  </Box>
                ))}

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => {
                    // Show answer - in production you'd verify this
                    alert('Check your answer using the Helper tab for detailed feedback!');
                  }}
                >
                  Check Answer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ borderRadius: 3, boxShadow: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Select a problem to start practicing
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  const renderSolverTab = () => (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
          🔧 FIRST & FOLLOW Solver
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter a grammar and let the system automatically compute FIRST and FOLLOW sets
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={8}
          label="Enter Grammar"
          placeholder={"E -> TE'\nE' -> +TE' | ε\nT -> FT'\nT' -> *FT' | ε\nF -> (E) | id"}
          value={solverGrammar}
          onChange={(e) => setSolverGrammar(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
            onClick={handleSolverGenerate}
            disabled={loading || !solverGrammar.trim()}
            fullWidth
          >
            Generate FIRST & FOLLOW
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleSolverReset}
            disabled={loading}
          >
            Reset
          </Button>
        </Box>

        {solverResult && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📊 Results:
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'success.dark' }}>
                    FIRST Sets:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Non-Terminal</strong></TableCell>
                          <TableCell><strong>FIRST Set</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(solverResult.firstSets || {}).map(([nt, set]) => (
                          <TableRow key={nt}>
                            <TableCell>{nt}</TableCell>
                            <TableCell>
                              {'{' + Array.from(set).join(', ') + '}'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.dark' }}>
                    FOLLOW Sets:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Non-Terminal</strong></TableCell>
                          <TableCell><strong>FOLLOW Set</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(solverResult.followSets || {}).map(([nt, set]) => (
                          <TableRow key={nt}>
                            <TableCell>{nt}</TableCell>
                            <TableCell>
                              {'{' + Array.from(set).join(', ') + '}'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📝 Step-by-Step Computation:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#fafafa', maxHeight: 400, overflow: 'auto' }}>
              {solverResult.steps?.map((step, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {step}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderHelperTab = () => (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'secondary.main' }}>
          🧠 Smart Helper - Debug Your Answer
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your grammar and your computed FIRST/FOLLOW sets. Get intelligent feedback on what's correct and what needs fixing!
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={6}
          label="Enter Grammar"
          placeholder={"E -> TE'\nE' -> +TE' | ε\nT -> FT'\nT' -> *FT' | ε\nF -> (E) | id"}
          value={helperGrammar}
          onChange={(e) => handleHelperGrammarChange(e.target.value)}
          sx={{ mb: 3 }}
        />

        {Object.keys(helperFirstSets).length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Enter Your FIRST Sets:
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.keys(helperFirstSets).map(nt => (
                <Grid item xs={12} sm={6} key={`helper-first-${nt}`}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`FIRST(${nt})`}
                    value={helperFirstSets[nt]}
                    onChange={(e) => setHelperFirstSets({ ...helperFirstSets, [nt]: e.target.value })}
                    placeholder="e.g., a, b, ε"
                  />
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Enter Your FOLLOW Sets:
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.keys(helperFollowSets).map(nt => (
                <Grid item xs={12} sm={6} key={`helper-follow-${nt}`}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`FOLLOW(${nt})`}
                    value={helperFollowSets[nt]}
                    onChange={(e) => setHelperFollowSets({ ...helperFollowSets, [nt]: e.target.value })}
                    placeholder="e.g., $, )"
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <HelpOutline />}
                onClick={handleHelperCheck}
                disabled={loading}
                fullWidth
              >
                Check My Work
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleHelperReset}
                disabled={loading}
              >
                Reset
              </Button>
            </Box>
          </>
        )}

        {helperFeedback && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Alert 
              severity={helperFeedback.correct ? "success" : "warning"}
              sx={{ mb: 3 }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {helperFeedback.overallMessage}
              </Typography>
            </Alert>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📋 Detailed Feedback:
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  FIRST Sets Feedback
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(helperFeedback.firstFeedback || {}).map(([nt, feedback]) => (
                  <Box key={`first-feedback-${nt}`} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {feedback.emoji === '✅' && <CheckCircle color="success" sx={{ mr: 1 }} />}
                      {feedback.emoji === '⚠️' && <Warning color="warning" sx={{ mr: 1 }} />}
                      {feedback.emoji === '🚫' && <ErrorIcon color="error" sx={{ mr: 1 }} />}
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        FIRST({nt})
                      </Typography>
                    </Box>
                    
                    {feedback.missing?.length > 0 && (
                      <Chip 
                        label={`Missing: ${feedback.missing.join(', ')}`} 
                        color="error" 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                    )}
                    {feedback.extra?.length > 0 && (
                      <Chip 
                        label={`Extra: ${feedback.extra.join(', ')}`} 
                        color="warning" 
                        size="small" 
                        sx={{ mb: 1 }} 
                      />
                    )}
                    
                    {feedback.hints?.map((hint, idx) => (
                      <Alert key={idx} severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">{hint}</Typography>
                      </Alert>
                    ))}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  FOLLOW Sets Feedback
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(helperFeedback.followFeedback || {}).map(([nt, feedback]) => (
                  <Box key={`follow-feedback-${nt}`} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {feedback.emoji === '✅' && <CheckCircle color="success" sx={{ mr: 1 }} />}
                      {feedback.emoji === '⚠️' && <Warning color="warning" sx={{ mr: 1 }} />}
                      {feedback.emoji === '🚫' && <ErrorIcon color="error" sx={{ mr: 1 }} />}
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        FOLLOW({nt})
                      </Typography>
                    </Box>
                    
                    {feedback.missing?.length > 0 && (
                      <Chip 
                        label={`Missing: ${feedback.missing.join(', ')}`} 
                        color="error" 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                    )}
                    {feedback.extra?.length > 0 && (
                      <Chip 
                        label={`Extra: ${feedback.extra.join(', ')}`} 
                        color="warning" 
                        size="small" 
                        sx={{ mb: 1 }} 
                      />
                    )}
                    
                    {feedback.hints?.map((hint, idx) => (
                      <Alert key={idx} severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">{hint}</Typography>
                      </Alert>
                    ))}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        FIRST and FOLLOW Sets
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="📚 Theory" />
          <Tab label="📝 Problems" />
          <Tab label="🔧 Solver" />
          <Tab label="🧠 Helper" />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        {renderTheoryTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {renderProblemsTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {renderSolverTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {renderHelperTab()}
      </TabPanel>
    </Container>
  );
}

export default FirstFollow;
