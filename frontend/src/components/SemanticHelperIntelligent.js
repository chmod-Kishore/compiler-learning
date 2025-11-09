import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Collapse,
  IconButton,
  Grid
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Help,
  Lightbulb,
  CompareArrows,
  TipsAndUpdates,
  Warning,
  Close
} from '@mui/icons-material';

// Mock API for answer comparison
const mockCompareAnswers = async (problemId, stepNumber, userAnswer, topic) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate intelligent comparison
      const result = simulateComparison(stepNumber, userAnswer);
      resolve(result);
    }, 800);
  });
};

function IntelligentSemanticHelper({ topic }) {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [comparisons, setComparisons] = useState({});
  const [showDetailedHelp, setShowDetailedHelp] = useState({});
  const [loading, setLoading] = useState(false);

  const problems = getHelperProblems(topic);

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setCurrentStep(0);
    setUserAnswers({});
    setComparisons({});
    setShowDetailedHelp({});
  };

  const handleAnswerChange = (stepIndex, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [stepIndex]: value
    }));
    // Clear previous comparison when user changes answer
    setComparisons(prev => {
      const newComparisons = { ...prev };
      delete newComparisons[stepIndex];
      return newComparisons;
    });
  };

  const handleCompareAnswer = async (stepIndex) => {
    setLoading(true);
    try {
      const comparison = await mockCompareAnswers(
        selectedProblem.id, 
        stepIndex, 
        userAnswers[stepIndex],
        topic
      );
      
      setComparisons(prev => ({
        ...prev,
        [stepIndex]: comparison
      }));

      // Auto-advance if correct
      if (comparison.status === 'correct' && stepIndex < selectedProblem.steps.length - 1) {
        setTimeout(() => {
          setCurrentStep(stepIndex + 1);
        }, 1500);
      }
    } catch (error) {
      console.error('Error comparing answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetailedHelp = (stepIndex) => {
    setShowDetailedHelp(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  if (!selectedProblem) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            💡 Interactive Helper
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select a problem to get step-by-step help with intelligent feedback
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {problems.map((problem) => (
              <Grid item xs={12} sm={6} md={4} key={problem.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleProblemSelect(problem)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Problem {problem.id}
                      </Typography>
                      <Chip 
                        label={problem.difficulty} 
                        size="small"
                        color={getDifficultyColor(problem.difficulty)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {problem.title}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Chip 
                        label={`${problem.steps.length} steps`} 
                        size="small"
                        icon={<Help />}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  }

  const progress = ((currentStep + 1) / selectedProblem.steps.length) * 100;
  const allStepsComplete = Object.keys(comparisons).length === selectedProblem.steps.length &&
    Object.values(comparisons).every(c => c.status === 'correct');

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              💡 Problem {selectedProblem.id}: {selectedProblem.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get intelligent feedback on each step of your solution
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            onClick={() => setSelectedProblem(null)}
          >
            Back to Problems
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Problem Statement */}
        <Alert severity="info" sx={{ mb: 2 }}>
          {selectedProblem.question}
        </Alert>

        {selectedProblem.codeSnippet && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="caption" fontWeight={600} gutterBottom display="block">
              Code:
            </Typography>
            <Box component="pre" sx={{ 
              m: 0, 
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedProblem.codeSnippet}
            </Box>
          </Paper>
        )}

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
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

        {/* Step-by-Step Interface */}
        <Stepper activeStep={currentStep} orientation="vertical">
          {selectedProblem.steps.map((step, index) => {
            const comparison = comparisons[index];
            const hasAnswer = userAnswers[index]?.trim();

            return (
              <Step key={index} expanded>
                <StepLabel
                  optional={
                    comparison && (
                      <Chip
                        size="small"
                        icon={comparison.status === 'correct' ? <CheckCircle /> : 
                              comparison.status === 'partial' ? <Warning /> : <Cancel />}
                        label={
                          comparison.status === 'correct' ? 'Correct' : 
                          comparison.status === 'partial' ? 'Partially Correct' : 
                          'Incorrect'
                        }
                        color={
                          comparison.status === 'correct' ? 'success' : 
                          comparison.status === 'partial' ? 'warning' : 
                          'error'
                        }
                        sx={{ mt: 0.5 }}
                      />
                    )
                  }
                >
                  <Typography fontWeight={600}>{step.description}</Typography>
                </StepLabel>
                
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {/* Instruction */}
                    <Alert severity="info" icon={<TipsAndUpdates />} sx={{ mb: 2 }}>
                      {step.instruction}
                    </Alert>

                    {/* Expected Format Hint */}
                    {step.expectedFormat && (
                      <Paper elevation={0} sx={{ p: 1.5, mb: 2, bgcolor: '#fff3e0' }}>
                        <Typography variant="caption" fontWeight={600} display="block">
                          Expected Format:
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {step.expectedFormat}
                        </Typography>
                      </Paper>
                    )}

                    {/* User Input */}
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Your Answer"
                      value={userAnswers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder={step.placeholder}
                      disabled={comparison?.status === 'correct'}
                      sx={{ mb: 2 }}
                    />

                    {/* Comparison Results */}
                    {comparison && (
                      <ComparisonDisplay 
                        comparison={comparison}
                        onToggleHelp={() => toggleDetailedHelp(index)}
                        showHelp={showDetailedHelp[index]}
                      />
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<CompareArrows />}
                        onClick={() => handleCompareAnswer(index)}
                        disabled={!hasAnswer || comparison?.status === 'correct' || loading}
                        sx={{ 
                          bgcolor: '#00acc1', 
                          '&:hover': { bgcolor: '#00838f' }
                        }}
                      >
                        {loading ? 'Comparing...' : 'Check My Answer'}
                      </Button>

                      {comparison?.status !== 'correct' && hasAnswer && (
                        <Button
                          variant="outlined"
                          startIcon={<Lightbulb />}
                          onClick={() => toggleDetailedHelp(index)}
                        >
                          {showDetailedHelp[index] ? 'Hide Help' : 'Get Help'}
                        </Button>
                      )}

                      {index > 0 && (
                        <Button onClick={() => setCurrentStep(index - 1)}>
                          Previous
                        </Button>
                      )}
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>

        {/* Completion */}
        {allStepsComplete && (
          <Paper elevation={0} sx={{ p: 3, mt: 3, bgcolor: '#e8f5e9', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircle sx={{ fontSize: 48, color: '#2e7d32' }} />
              <Box>
                <Typography variant="h6" fontWeight={600} color="#2e7d32">
                  🎉 Perfect! You've completed all steps correctly!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You've mastered this {getTopicDisplayName(topic)} problem.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained"
                onClick={() => setSelectedProblem(null)}
                sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
              >
                Try Another Problem
              </Button>
            </Box>
          </Paper>
        )}
      </Paper>
    </Box>
  );
}

// Comparison Display Component
function ComparisonDisplay({ comparison, onToggleHelp, showHelp }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return '#e8f5e9';
      case 'partial': return '#fff3e0';
      case 'incorrect': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  return (
    <Box>
      {/* Main Feedback */}
      <Alert 
        severity={
          comparison.status === 'correct' ? 'success' : 
          comparison.status === 'partial' ? 'warning' : 
          'error'
        }
        sx={{ mb: 2 }}
      >
        <Typography variant="body2" fontWeight={600}>
          {comparison.feedback}
        </Typography>
      </Alert>

      {/* Detailed Comparison */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: getStatusColor(comparison.status), mb: 2 }}>
        <Grid container spacing={2}>
          {/* Your Answer */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1 }}>
              <Chip 
                label="Your Answer" 
                size="small" 
                sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
              />
            </Box>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'white' }}>
              <Typography variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                {comparison.userAnswer}
              </Typography>
            </Paper>
          </Grid>

          {/* Expected Answer */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1 }}>
              <Chip 
                label="Expected Answer" 
                size="small" 
                color="success"
              />
            </Box>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'white' }}>
              <Typography variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                {comparison.expectedAnswer}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Differences Highlighted */}
        {comparison.differences && comparison.differences.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
              Issues Found:
            </Typography>
            {comparison.differences.map((diff, idx) => (
              <Alert key={idx} severity="warning" sx={{ mb: 1, py: 0.5 }}>
                <Typography variant="body2">
                  {diff.type}: {diff.message}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}
      </Paper>

      {/* Detailed Help (Collapsible) */}
      <Collapse in={showHelp}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', border: '2px solid #2196f3' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} color="primary">
              💡 Detailed Help
            </Typography>
            <IconButton size="small" onClick={onToggleHelp}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Common Mistakes */}
          {comparison.commonMistakes && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                ⚠️ Common Mistakes to Avoid:
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {comparison.commonMistakes.map((mistake, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{mistake}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Hints */}
          {comparison.hints && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                💭 Hints:
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {comparison.hints.map((hint, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{hint}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Step-by-Step Guide */}
          {comparison.stepByStepGuide && (
            <Box>
              <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                📝 Step-by-Step Guide:
              </Typography>
              <Box sx={{ pl: 2 }}>
                {comparison.stepByStepGuide.map((guide, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{idx + 1}.</strong> {guide}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Collapse>
    </Box>
  );
}

// Helper Functions
function getDifficultyColor(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'success';
    case 'medium': return 'warning';
    case 'hard': return 'error';
    default: return 'default';
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

function simulateComparison(stepNumber, userAnswer) {
  // Simulate intelligent comparison
  const trimmedAnswer = userAnswer?.trim().toLowerCase() || '';
  
  // Mock comparison results based on common patterns
  if (trimmedAnswer.includes('int') && trimmedAnswer.includes('float')) {
    return {
      status: 'correct',
      feedback: 'Excellent! You correctly identified the types and coercion.',
      userAnswer: userAnswer,
      expectedAnswer: 'x: int, y: float, 2.5: float\nCoercion: int → float',
      differences: []
    };
  } else if (trimmedAnswer.includes('int') || trimmedAnswer.includes('float')) {
    return {
      status: 'partial',
      feedback: 'You\'re on the right track, but missing some details.',
      userAnswer: userAnswer,
      expectedAnswer: 'x: int, y: float, 2.5: float\nCoercion: int → float',
      differences: [
        { type: 'Missing', message: 'You didn\'t mention the type coercion needed' },
        { type: 'Format', message: 'Expected format: "variable: type"' }
      ],
      commonMistakes: [
        'Forgetting to identify literal types (like 2.5)',
        'Not mentioning required type coercion',
        'Mixing up which type gets coerced'
      ],
      hints: [
        'Remember that literals have types too (2.5 is a float)',
        'When mixing int and float, int is coerced to float',
        'Use the format: "variable: type" for each operand'
      ],
      stepByStepGuide: [
        'List each operand in the expression',
        'Identify the type of each operand from declarations or literal format',
        'Note any type coercions that will occur',
        'Write in the format: "operand: type"'
      ]
    };
  } else {
    return {
      status: 'incorrect',
      feedback: 'This doesn\'t match the expected answer. Let\'s break it down.',
      userAnswer: userAnswer,
      expectedAnswer: 'x: int, y: float, 2.5: float\nCoercion: int → float',
      differences: [
        { type: 'Format', message: 'Answer doesn\'t follow the expected format' },
        { type: 'Content', message: 'Missing type information for operands' }
      ],
      commonMistakes: [
        'Not checking variable declarations for types',
        'Forgetting that numeric literals have types',
        'Not considering type coercion rules'
      ],
      hints: [
        'Start by looking at the variable declarations: int x and float y',
        'The literal 2.5 is a float (because of the decimal point)',
        'Remember: when int and float are used together, int converts to float'
      ],
      stepByStepGuide: [
        'Identify variable x: look at declaration → int',
        'Identify variable y: look at declaration → float',
        'Identify literal 2.5: has decimal point → float',
        'Determine coercion: int + float requires int → float conversion',
        'Write answer as: "x: int, y: float, 2.5: float"'
      ]
    };
  }
}

function getHelperProblems(topic) {
  const problemsMap = {
    'type-checking': [
      {
        id: 1,
        difficulty: 'easy',
        title: 'Basic Type Checking',
        question: 'Perform type checking for: x + y * 2.5, where x is int and y is float',
        codeSnippet: 'int x = 10;\nfloat y = 20.5;\nfloat z = x + y * 2.5;',
        steps: [
          {
            description: 'Step 1: Identify operand types',
            instruction: 'List the type of each operand (x, y, 2.5) in the expression',
            expectedFormat: 'x: int, y: float, 2.5: float',
            placeholder: 'x: type, y: type, 2.5: type'
          },
          {
            description: 'Step 2: Check y * 2.5',
            instruction: 'What is the result type of y * 2.5?',
            expectedFormat: 'float (because float * float = float)',
            placeholder: 'Result type and reasoning'
          },
          {
            description: 'Step 3: Check x + (y * 2.5)',
            instruction: 'What type coercion is needed for the addition?',
            expectedFormat: 'int → float (x must be coerced to float)',
            placeholder: 'Type coercion needed'
          },
          {
            description: 'Step 4: Final result',
            instruction: 'What is the final type of the entire expression?',
            expectedFormat: 'float',
            placeholder: 'Final type'
          }
        ]
      },
      {
        id: 2,
        difficulty: 'medium',
        title: 'Function Type Checking',
        question: 'Verify function call: int foo(int a, float b); called as foo(10, 20);',
        codeSnippet: 'int foo(int a, float b) { return a; }\nint result = foo(10, 20);',
        steps: [
          {
            description: 'Step 1: Check argument count',
            instruction: 'Does the argument count match the parameter count?',
            expectedFormat: 'Yes, 2 arguments match 2 parameters',
            placeholder: 'Your analysis'
          },
          {
            description: 'Step 2: Check first argument',
            instruction: 'Is the first argument type-compatible?',
            expectedFormat: 'Yes, 10 (int) matches parameter a (int)',
            placeholder: 'Your analysis'
          },
          {
            description: 'Step 3: Check second argument',
            instruction: 'Is the second argument type-compatible? What coercion is needed?',
            expectedFormat: 'Compatible with coercion: 20 (int) → float for parameter b',
            placeholder: 'Your analysis'
          }
        ]
      }
    ],
    'sdt': [
      {
        id: 1,
        difficulty: 'medium',
        title: 'SDT Evaluation',
        question: 'Evaluate 3 * 4 + 5 using SDT rules',
        codeSnippet: 'E → E + T { E.val = E1.val + T.val }\nT → T * F { T.val = T1.val * F.val }\nF → digit { F.val = digit.value }',
        steps: [
          {
            description: 'Step 1: Parse leftmost operand',
            instruction: 'What production and value for 3?',
            expectedFormat: 'F → 3, F.val = 3',
            placeholder: 'Production and value'
          },
          {
            description: 'Step 2: Build first T',
            instruction: 'How does T get its value from F?',
            expectedFormat: 'T → F, T.val = F.val = 3',
            placeholder: 'Production and computation'
          },
          {
            description: 'Step 3: Handle multiplication',
            instruction: 'After parsing 4, what is the new T.val?',
            expectedFormat: 'T → T * F, T.val = 3 * 4 = 12',
            placeholder: 'Production and computation'
          }
        ]
      }
    ],
    'symbol-table': [
      {
        id: 1,
        difficulty: 'easy',
        title: 'Symbol Table Construction',
        question: 'Build symbol table for: int x; float y; void foo(int a) { int b; }',
        codeSnippet: 'int x;\nfloat y;\nvoid foo(int a) {\n    int b;\n}',
        steps: [
          {
            description: 'Step 1: Insert first variable',
            instruction: 'Add entry for x',
            expectedFormat: 'x: int, scope=global, offset=0',
            placeholder: 'name: type, scope, offset'
          },
          {
            description: 'Step 2: Insert second variable',
            instruction: 'Add entry for y',
            expectedFormat: 'y: float, scope=global, offset=4',
            placeholder: 'name: type, scope, offset'
          },
          {
            description: 'Step 3: Handle function',
            instruction: 'What happens when entering function foo?',
            expectedFormat: 'Create new scope "foo", insert foo in global as function',
            placeholder: 'Describe scope changes'
          }
        ]
      }
    ],
    'attributes': [
      {
        id: 1,
        difficulty: 'easy',
        title: 'Attribute Classification',
        question: 'Classify attributes in: D → T L { L.type = T.type }',
        codeSnippet: 'D → T L { L.type = T.type }\nT → int { T.type = integer }',
        steps: [
          {
            description: 'Step 1: Classify T.type',
            instruction: 'Is T.type synthesized or inherited? Why?',
            expectedFormat: 'Synthesized - computed at T from its own production',
            placeholder: 'Attribute type and reason'
          },
          {
            description: 'Step 2: Classify L.type',
            instruction: 'Is L.type synthesized or inherited? Why?',
            expectedFormat: 'Inherited - passed down from parent D',
            placeholder: 'Attribute type and reason'
          }
        ]
      }
    ],
    'semantic-actions': [
      {
        id: 1,
        difficulty: 'medium',
        title: 'Assignment Semantic Actions',
        question: 'Write semantic actions for: id = E',
        codeSnippet: 'S → id = E ;',
        steps: [
          {
            description: 'Step 1: Lookup variable',
            instruction: 'What\'s the first action?',
            expectedFormat: 'entry = lookup(id.name)',
            placeholder: 'First semantic action'
          },
          {
            description: 'Step 2: Check declaration',
            instruction: 'How do you handle undeclared variables?',
            expectedFormat: 'if (entry == null) error("Undeclared variable")',
            placeholder: 'Error checking code'
          },
          {
            description: 'Step 3: Type checking',
            instruction: 'How do you verify type compatibility?',
            expectedFormat: 'if (entry.type != E.type) check compatibility or error',
            placeholder: 'Type checking code'
          }
        ]
      }
    ]
  };

  return problemsMap[topic] || [];
}

export default IntelligentSemanticHelper;