import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Help,
  Lightbulb,
  NavigateNext,
  NavigateBefore,
  Refresh,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

// Mock API functions - replace with actual API calls
const mockGetProblems = async (topic) => {
  // Simulates API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getProblemsByTopic(topic));
    }, 300);
  });
};

const mockValidateStep = async (problemId, stepNumber, userAnswer) => {
  // Simulates API validation
  return new Promise((resolve) => {
    setTimeout(() => {
      const isCorrect = Math.random() > 0.3; // Mock validation
      resolve({
        correct: isCorrect,
        feedback: isCorrect ? 
          "Excellent! Your answer is correct." : 
          "Not quite right. Check the expected format.",
        hint: "Remember to consider type coercion rules."
      });
    }, 500);
  });
};

function InteractiveSemanticPractice({ topic }) {
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [stepValidation, setStepValidation] = useState({});
  const [showHint, setShowHint] = useState({});
  const [showTree, setShowTree] = useState(false);
  const [treeAnimationStep, setTreeAnimationStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, [topic]);

  useEffect(() => {
    // Reset when problem changes
    setActiveStep(0);
    setUserAnswers({});
    setStepValidation({});
    setShowHint({});
    setShowTree(false);
    setTreeAnimationStep(0);
  }, [currentProblem]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const data = await mockGetProblems(topic);
      setProblems(data);
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (stepIndex, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [stepIndex]: value
    }));
  };

  const handleValidateStep = async (stepIndex) => {
    const problem = problems[currentProblem];
    const userAnswer = userAnswers[stepIndex];

    if (!userAnswer || !userAnswer.trim()) {
      setStepValidation(prev => ({
        ...prev,
        [stepIndex]: {
          status: 'error',
          message: 'Please enter an answer before validating.'
        }
      }));
      return;
    }

    try {
      const result = await mockValidateStep(problem.id, stepIndex, userAnswer);
      setStepValidation(prev => ({
        ...prev,
        [stepIndex]: {
          status: result.correct ? 'success' : 'error',
          message: result.feedback,
          hint: result.hint
        }
      }));

      if (result.correct) {
        setTimeout(() => {
          if (stepIndex < problem.steps.length - 1) {
            setActiveStep(stepIndex + 1);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating step:', error);
    }
  };

  const handleToggleHint = (stepIndex) => {
    setShowHint(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const handleNextProblem = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
    }
  };

  const handlePrevProblem = () => {
    if (currentProblem > 0) {
      setCurrentProblem(currentProblem - 1);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setUserAnswers({});
    setStepValidation({});
    setShowHint({});
    setTreeAnimationStep(0);
  };

  const toggleTreeVisualization = () => {
    setShowTree(!showTree);
    if (!showTree) {
      animateTree();
    }
  };

  const animateTree = () => {
    const problem = problems[currentProblem];
    let step = 0;
    const interval = setInterval(() => {
      setTreeAnimationStep(step);
      step++;
      if (step > (problem.treeNodes?.length || 0)) {
        clearInterval(interval);
      }
    }, 800);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading problems...</Typography>
      </Box>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No problems available for this topic</Typography>
      </Box>
    );
  }

  const problem = problems[currentProblem];
  const progress = ((activeStep + 1) / problem.steps.length) * 100;
  const allStepsComplete = activeStep === problem.steps.length;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Left Panel - Problem Navigation */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Problems
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {problems.map((p, idx) => (
                <Card
                  key={p.id}
                  elevation={currentProblem === idx ? 4 : 0}
                  sx={{
                    cursor: 'pointer',
                    borderLeft: currentProblem === idx ? '4px solid #00acc1' : 'none',
                    bgcolor: currentProblem === idx ? 'rgba(0, 172, 193, 0.1)' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(0, 172, 193, 0.05)',
                      transform: 'translateX(4px)'
                    }
                  }}
                  onClick={() => setCurrentProblem(idx)}
                >
                  <CardContent sx={{ py: 1.5, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600} fontSize="0.9rem">
                        Problem {idx + 1}
                      </Typography>
                      <Chip 
                        label={p.difficulty} 
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: getDifficultyColor(p.difficulty),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Problem Content */}
        <Grid item xs={12} md={9}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* Problem Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  Problem {currentProblem + 1}: {getTopicDisplayName(topic)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={handlePrevProblem} disabled={currentProblem === 0}>
                    <NavigateBefore />
                  </IconButton>
                  <IconButton onClick={handleNextProblem} disabled={currentProblem === problems.length - 1}>
                    <NavigateNext />
                  </IconButton>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                {problem.question}
              </Alert>

              {problem.codeSnippet && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                  <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                    Code:
                  </Typography>
                  <Box component="pre" sx={{ 
                    m: 0, 
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {problem.codeSnippet}
                  </Box>
                </Paper>
              )}

              {/* Progress Bar */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress: Step {Math.min(activeStep + 1, problem.steps.length)} of {problem.steps.length}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#00acc1'
                    }
                  }} 
                />
              </Box>

              {/* Tree Visualization Toggle */}
              {problem.hasTreeVisualization && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={showTree ? <VisibilityOff /> : <Visibility />}
                    onClick={toggleTreeVisualization}
                    sx={{ borderColor: '#00acc1', color: '#00acc1' }}
                  >
                    {showTree ? 'Hide' : 'Show'} Parse Tree
                  </Button>
                </Box>
              )}
            </Box>

            {/* Tree Visualization */}
            {showTree && problem.hasTreeVisualization && (
              <Fade in={showTree}>
                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f0f7ff', border: '2px dashed #00acc1' }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    🌳 Parse Tree Visualization
                  </Typography>
                  <TreeVisualization 
                    topic={topic}
                    problem={problem}
                    animationStep={treeAnimationStep}
                  />
                </Paper>
              </Fade>
            )}

            {/* Step-by-Step Stepper */}
            <Stepper activeStep={activeStep} orientation="vertical">
              {problem.steps.map((step, index) => (
                <Step key={index} expanded>
                  <StepLabel
                    optional={
                      stepValidation[index] && (
                        <Chip
                          size="small"
                          icon={stepValidation[index].status === 'success' ? <CheckCircle /> : <Cancel />}
                          label={stepValidation[index].status === 'success' ? 'Correct' : 'Incorrect'}
                          color={stepValidation[index].status === 'success' ? 'success' : 'error'}
                          sx={{ mt: 0.5 }}
                        />
                      )
                    }
                  >
                    <Typography fontWeight={600}>{step.description}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {step.instruction && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          {step.instruction}
                        </Alert>
                      )}

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={`Your answer for Step ${index + 1}`}
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder={step.placeholder || "Enter your answer..."}
                        disabled={stepValidation[index]?.status === 'success'}
                        sx={{ mb: 2 }}
                      />

                      {stepValidation[index] && (
                        <Zoom in>
                          <Alert 
                            severity={stepValidation[index].status} 
                            sx={{ mb: 2 }}
                            action={
                              stepValidation[index].status === 'error' && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleHint(index)}
                                >
                                  <Lightbulb />
                                </IconButton>
                              )
                            }
                          >
                            {stepValidation[index].message}
                          </Alert>
                        </Zoom>
                      )}

                      <Collapse in={showHint[index]}>
                        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#fff3e0' }}>
                          <Typography variant="body2" fontWeight={600} gutterBottom>
                            💡 Hint:
                          </Typography>
                          <Typography variant="body2">
                            {stepValidation[index]?.hint || step.hint}
                          </Typography>
                        </Paper>
                      </Collapse>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleValidateStep(index)}
                          disabled={stepValidation[index]?.status === 'success' || !userAnswers[index]?.trim()}
                          sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
                        >
                          Check Answer
                        </Button>
                        
                        {stepValidation[index]?.status === 'error' && (
                          <Button
                            variant="outlined"
                            startIcon={<Help />}
                            onClick={() => handleToggleHint(index)}
                          >
                            {showHint[index] ? 'Hide Hint' : 'Show Hint'}
                          </Button>
                        )}

                        {index > 0 && (
                          <Button onClick={() => setActiveStep(index - 1)}>
                            Back
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {/* Completion Message */}
            {allStepsComplete && (
              <Zoom in>
                <Paper elevation={0} sx={{ p: 3, mt: 3, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 48, color: '#2e7d32' }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#2e7d32' }}>
                        🎉 Problem Completed!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Great job! You've successfully solved this problem.
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<NavigateNext />}
                      onClick={handleNextProblem}
                      disabled={currentProblem === problems.length - 1}
                      sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
                    >
                      Next Problem
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={handleReset}
                    >
                      Try Again
                    </Button>
                  </Box>
                </Paper>
              </Zoom>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// Tree Visualization Component
function TreeVisualization({ topic, problem, animationStep }) {
  const renderTypeCheckingTree = () => (
    <Box sx={{ position: 'relative', minHeight: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width="600" height="300" style={{ overflow: 'visible' }}>
        {/* Root node */}
        <TreeNode x={300} y={30} label="+" type="float" show={animationStep >= 1} />
        
        {/* Left subtree */}
        <TreeEdge x1={300} y1={50} x2={200} y2={100} show={animationStep >= 2} />
        <TreeNode x={200} y={100} label="x" type="int→float" show={animationStep >= 2} />
        
        {/* Right subtree */}
        <TreeEdge x1={300} y1={50} x2={400} y2={100} show={animationStep >= 3} />
        <TreeNode x={400} y={100} label="*" type="float" show={animationStep >= 3} />
        
        <TreeEdge x1={400} y1={120} x2={350} y2={170} show={animationStep >= 4} />
        <TreeNode x={350} y={170} label="y" type="float" show={animationStep >= 4} />
        
        <TreeEdge x1={400} y1={120} x2={450} y2={170} show={animationStep >= 5} />
        <TreeNode x={450} y={170} label="2.5" type="float" show={animationStep >= 5} />
      </svg>
    </Box>
  );

  const renderSDTTree = () => (
    <Box sx={{ position: 'relative', minHeight: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width="700" height="350" style={{ overflow: 'visible' }}>
        {/* Expression tree for 3 * 4 + 5 */}
        <TreeNode x={350} y={30} label="E" value="17" show={animationStep >= 8} />
        
        <TreeEdge x1={350} y1={50} x2={250} y2={100} show={animationStep >= 5} />
        <TreeNode x={250} y={100} label="E" value="12" show={animationStep >= 5} />
        
        <TreeEdge x1={350} y1={50} x2={350} y2={100} show={animationStep >= 8} />
        <TreeNode x={350} y={100} label="+" value="" show={animationStep >= 8} />
        
        <TreeEdge x1={350} y1={50} x2={450} y2={100} show={animationStep >= 6} />
        <TreeNode x={450} y={100} label="T" value="5" show={animationStep >= 6} />
        
        <TreeEdge x1={250} y1={120} x2={250} y2={170} show={animationStep >= 4} />
        <TreeNode x={250} y={170} label="T" value="12" show={animationStep >= 4} />
        
        <TreeEdge x1={250} y1={190} x2={200} y2={240} show={animationStep >= 2} />
        <TreeNode x={200} y={240} label="T" value="3" show={animationStep >= 2} />
        
        <TreeEdge x1={250} y1={190} x2={250} y2={240} show={animationStep >= 4} />
        <TreeNode x={250} y={240} label="*" value="" show={animationStep >= 4} />
        
        <TreeEdge x1={250} y1={190} x2={300} y2={240} show={animationStep >= 3} />
        <TreeNode x={300} y={240} label="F" value="4" show={animationStep >= 3} />
        
        <TreeEdge x1={200} y1={260} x2={200} y2={310} show={animationStep >= 1} />
        <TreeNode x={200} y={310} label="3" value="3" show={animationStep >= 1} />
      </svg>
    </Box>
  );

  const renderSymbolTableVisualization = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Scope Stack Visualization
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {animationStep >= 1 && (
          <Zoom in>
            <Paper elevation={2} sx={{ p: 2, bgcolor: '#e3f2fd' }}>
              <Typography variant="caption" fontWeight={600}>Scope 0 (Global)</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="x: int" size="small" />
                {animationStep >= 2 && <Chip label="y: float" size="small" />}
                {animationStep >= 3 && <Chip label="foo: function" size="small" />}
              </Box>
            </Paper>
          </Zoom>
        )}
        
        {animationStep >= 4 && (
          <Zoom in>
            <Paper elevation={2} sx={{ p: 2, bgcolor: '#fff3e0', ml: 4 }}>
              <Typography variant="caption" fontWeight={600}>Scope 1 (foo)</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="a: int (param)" size="small" color="primary" />
                {animationStep >= 5 && <Chip label="b: int" size="small" />}
              </Box>
            </Paper>
          </Zoom>
        )}
      </Box>
    </Box>
  );

  // Render based on topic
  if (topic === 'type-checking') {
    return renderTypeCheckingTree();
  } else if (topic === 'sdt') {
    return renderSDTTree();
  } else if (topic === 'symbol-table') {
    return renderSymbolTableVisualization();
  }

  return <Typography>Tree visualization for {topic}</Typography>;
}

// Tree Node Component
function TreeNode({ x, y, label, type, value, show }) {
  if (!show) return null;

  return (
    <Zoom in={show}>
      <g>
        <circle
          cx={x}
          cy={y}
          r={25}
          fill="#00acc1"
          stroke="#00838f"
          strokeWidth="2"
        />
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="600"
        >
          {label}
        </text>
        {(type || value) && (
          <text
            x={x}
            y={y + 45}
            textAnchor="middle"
            fill="#00838f"
            fontSize="11"
            fontWeight="500"
          >
            {type || value}
          </text>
        )}
      </g>
    </Zoom>
  );
}

// Tree Edge Component
function TreeEdge({ x1, y1, x2, y2, show }) {
  if (!show) return null;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#00acc1"
      strokeWidth="2"
    />
  );
}

// Helper functions
function getDifficultyColor(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return '#4caf50';
    case 'medium': return '#ff9800';
    case 'hard': return '#f44336';
    default: return '#757575';
  }
}

function getTopicDisplayName(topic) {
  const names = {
    'type-checking': 'Type Checking',
    'sdt': 'Syntax-Directed Translation',
    'attributes': 'Attribute Grammars',
    'symbol-table': 'Symbol Table Construction',
    'semantic-actions': 'Semantic Actions'
  };
  return names[topic] || topic;
}

// Mock data function
function getProblemsByTopic(topic) {
  const problemsMap = {
    'type-checking': [
      {
        id: 1,
        difficulty: 'easy',
        question: 'Perform type checking for the expression: x + y * 2.5, where x is int and y is float',
        codeSnippet: 'int x = 10;\nfloat y = 20.5;\nfloat z = x + y * 2.5;',
        hasTreeVisualization: true,
        steps: [
          {
            description: 'Step 1: Identify operand types',
            instruction: 'List the type of each operand in the expression',
            placeholder: 'x: int, y: float, 2.5: float',
            hint: 'Check declarations and literal formats'
          },
          {
            description: 'Step 2: Evaluate y * 2.5',
            instruction: 'What is the result type of y * 2.5?',
            placeholder: 'float',
            hint: 'Both operands are float, so the result is float'
          },
          {
            description: 'Step 3: Evaluate x + (y * 2.5)',
            instruction: 'What type coercion is needed for x + result?',
            placeholder: 'int → float',
            hint: 'int must be coerced to float before addition'
          },
          {
            description: 'Step 4: Final result type',
            instruction: 'What is the final type of the entire expression?',
            placeholder: 'float',
            hint: 'After coercion, float + float = float'
          }
        ]
      },
      {
        id: 2,
        difficulty: 'medium',
        question: 'Check if the function call is valid: int foo(int a, float b); called as foo(10, 20);',
        codeSnippet: 'int foo(int a, float b) {\n    return a;\n}\nint result = foo(10, 20);',
        hasTreeVisualization: false,
        steps: [
          {
            description: 'Step 1: Check argument count',
            instruction: 'Does the number of arguments match?',
            placeholder: 'Yes, 2 arguments provided, 2 expected',
            hint: 'Count the arguments in the call vs. parameters in declaration'
          },
          {
            description: 'Step 2: Check first argument',
            instruction: 'Is argument 1 type-compatible?',
            placeholder: 'Yes, int matches int',
            hint: 'First argument is 10 (int), first parameter is int'
          },
          {
            description: 'Step 3: Check second argument',
            instruction: 'Is argument 2 type-compatible? What coercion is needed?',
            placeholder: 'Yes with coercion: int → float',
            hint: 'Second argument is 20 (int), second parameter is float'
          }
        ]
      }
    ],
    'sdt': [
      {
        id: 1,
        difficulty: 'medium',
        question: 'Write SDT rules for evaluating: 3 * 4 + 5',
        codeSnippet: 'E → E1 + T    { E.val = E1.val + T.val }\nT → T1 * F    { T.val = T1.val * F.val }\nF → digit     { F.val = digit.value }',
        hasTreeVisualization: true,
        steps: [
          {
            description: 'Step 1: Parse 3',
            instruction: 'What production and value for the digit 3?',
            placeholder: 'F → 3, F.val = 3',
            hint: 'Start with the leftmost digit'
          },
          {
            description: 'Step 2: Build T from F',
            instruction: 'What is T.val?',
            placeholder: 'T → F, T.val = 3',
            hint: 'T inherits value from F'
          },
          {
            description: 'Step 3: Parse 4 and apply multiplication',
            instruction: 'After parsing 4, what is the new T.val?',
            placeholder: 'T → T * F, T.val = 3 * 4 = 12',
            hint: 'Multiply previous T.val by F.val'
          },
          {
            description: 'Step 4: Build E from T',
            instruction: 'What is E.val before addition?',
            placeholder: 'E → T, E.val = 12',
            hint: 'E inherits from T'
          },
          {
            description: 'Step 5: Parse 5 and apply addition',
            instruction: 'What is the final E.val?',
            placeholder: 'E → E + T, E.val = 12 + 5 = 17',
            hint: 'Add previous E.val to T.val'
          }
        ]
      }
    ],
    'symbol-table': [
      {
        id: 1,
        difficulty: 'easy',
        question: 'Create a symbol table for: int x; float y; void foo(int a) { int b; }',
        codeSnippet: 'int x;\nfloat y;\nvoid foo(int a) {\n    int b;\n}',
        hasTreeVisualization: true,
        steps: [
          {
            description: 'Step 1: Insert variable x',
            instruction: 'Add entry for x to the global scope',
            placeholder: 'x: int, scope=global, offset=0',
            hint: 'First global variable starts at offset 0'
          },
          {
            description: 'Step 2: Insert variable y',
            instruction: 'Add entry for y to the global scope',
            placeholder: 'y: float, scope=global, offset=4',
            hint: 'int is 4 bytes, so y starts at offset 4'
          },
          {
            description: 'Step 3: Insert function foo',
            instruction: 'Add entry for function foo',
            placeholder: 'foo: function(int)→void, scope=global',
            hint: 'Functions are also in global scope'
          },
          {
            description: 'Step 4: Enter function scope',
            instruction: 'What happens when we enter foo\'s body?',
            placeholder: 'Create new scope for foo',
            hint: 'Nested scopes for function bodies'
          },
          {
            description: 'Step 5: Insert parameter a',
            instruction: 'Add entry for parameter a',
            placeholder: 'a: int, scope=foo, offset=0',
            hint: 'Parameters have their own offsets in function scope'
          },
          {
            description: 'Step 6: Insert local variable b',
            instruction: 'Add entry for local variable b',
            placeholder: 'b: int, scope=foo, offset=4',
            hint: 'Local variables follow parameters'
          }
        ]
      }
    ],
    'attributes': [
      {
        id: 1,
        difficulty: 'easy',
        question: 'Identify synthesized and inherited attributes in: D → T L { L.type = T.type }',
        codeSnippet: 'D → T L        { L.type = T.type }\nT → int        { T.type = integer }\nL → L1, id     { L1.type = L.type }',
        hasTreeVisualization: false,
        steps: [
          {
            description: 'Step 1: Classify T.type',
            instruction: 'Is T.type synthesized or inherited? Why?',
            placeholder: 'Synthesized - computed at T from its production',
            hint: 'T.type is set by T\'s own production rule'
          },
          {
            description: 'Step 2: Classify L.type',
            instruction: 'Is L.type synthesized or inherited? Why?',
            placeholder: 'Inherited - passed down from parent D',
            hint: 'L.type gets its value from D\'s action'
          },
          {
            description: 'Step 3: Describe data flow',
            instruction: 'How does information flow in this grammar?',
            placeholder: 'T.type flows up (↑), then L.type flows down (↓)',
            hint: 'Synthesized = upward, Inherited = downward'
          }
        ]
      }
    ],
    'semantic-actions': [
      {
        id: 1,
        difficulty: 'medium',
        question: 'Write semantic actions for type checking: id = E',
        codeSnippet: 'S → id = E ;\n{\n    // Your semantic action here\n}',
        hasTreeVisualization: false,
        steps: [
          {
            description: 'Step 1: Lookup identifier',
            instruction: 'What\'s the first action needed?',
            placeholder: 'entry = lookup(id.name)',
            hint: 'Check if variable is declared in symbol table'
          },
          {
            description: 'Step 2: Check declaration',
            instruction: 'What if the identifier is not found?',
            placeholder: 'if (entry == null) error("Undeclared variable")',
            hint: 'Handle undeclared variable error'
          },
          {
            description: 'Step 3: Type compatibility check',
            instruction: 'How do you check if types match?',
            placeholder: 'if (entry.type != E.type) check_coercion_or_error',
            hint: 'Compare variable type with expression type'
          },
          {
            description: 'Step 4: Generate code',
            instruction: 'What code do you emit for valid assignment?',
            placeholder: 'emit("MOV " + id.name + ", " + E.addr)',
            hint: 'Generate assembly/intermediate code'
          }
        ]
      }
    ]
  };

  return problemsMap[topic] || [];
}

export default InteractiveSemanticPractice;