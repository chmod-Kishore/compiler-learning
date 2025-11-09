import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Divider, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  PlayArrow, 
  Clear, 
  CheckCircle, 
  Error as ErrorIcon,
  ExpandMore,
  Info
} from '@mui/icons-material';

// Mock API call
const mockAnalyzeCode = async (code, topic) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockResultForTopic(topic, code));
    }, 1000);
  });
};

function TopicSpecificSemanticSolver({ topic }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (inputData) => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await mockAnalyzeCode(inputData, topic);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
  };

  // Render topic-specific solver interface
  const renderSolverInterface = () => {
    switch (topic) {
      case 'type-checking':
        return <TypeCheckingSolver onAnalyze={handleAnalyze} onClear={handleClear} />;
      case 'sdt':
        return <SDTSolver onAnalyze={handleAnalyze} onClear={handleClear} />;
      case 'symbol-table':
        return <SymbolTableSolver onAnalyze={handleAnalyze} onClear={handleClear} />;
      case 'attributes':
        return <AttributesSolver onAnalyze={handleAnalyze} onClear={handleClear} />;
      case 'semantic-actions':
        return <SemanticActionsSolver onAnalyze={handleAnalyze} onClear={handleClear} />;
      default:
        return <GenericSolver onAnalyze={handleAnalyze} onClear={handleClear} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          🔧 {getTopicDisplayName(topic)} Solver
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {getTopicDescription(topic)}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {renderSolverInterface()}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#00acc1' }} />
            <Typography sx={{ ml: 2 }}>Analyzing...</Typography>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {/* Results Display */}
        {result && !loading && (
          <ResultsDisplay result={result} topic={topic} />
        )}
      </Paper>
    </Box>
  );
}

// Type Checking Solver
function TypeCheckingSolver({ onAnalyze, onClear }) {
  const [declarations, setDeclarations] = useState('int x = 10;\nfloat y = 5.5;');
  const [expression, setExpression] = useState('x + y * 2');

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Variable Declarations"
            value={declarations}
            onChange={(e) => setDeclarations(e.target.value)}
            placeholder="int x = 10;&#10;float y = 5.5;"
            sx={{ 
              '& textarea': { 
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Expression to Type Check"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="x + y * 2"
            sx={{ 
              '& textarea': { 
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem'
              }
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlayArrow />}
          onClick={() => onAnalyze({ declarations, expression })}
          sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
        >
          Analyze Types
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Clear />}
          onClick={() => {
            setDeclarations('');
            setExpression('');
            onClear();
          }}
        >
          Clear
        </Button>
      </Box>

      {/* Examples */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          💡 Try these examples:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label="int + float" 
            onClick={() => {
              setDeclarations('int a = 5;\nfloat b = 3.14;');
              setExpression('a + b');
            }}
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Type mismatch" 
            onClick={() => {
              setDeclarations('int x = 5;\nchar c = \'a\';');
              setExpression('boolean b = x + c');
            }}
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Function call" 
            onClick={() => {
              setDeclarations('int foo(int a, float b);');
              setExpression('foo(10, 20)');
            }}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </Box>
    </Box>
  );
}

// SDT Solver
function SDTSolver({ onAnalyze, onClear }) {
  const [grammar, setGrammar] = useState('E → E + T\nE → T\nT → T * F\nT → F\nF → digit');
  const [expression, setExpression] = useState('3 * 4 + 5');
  const [outputType, setOutputType] = useState('value');

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={5}
            label="Grammar Rules"
            value={grammar}
            onChange={(e) => setGrammar(e.target.value)}
            placeholder="E → E + T&#10;T → T * F&#10;..."
            sx={{ 
              '& textarea': { 
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Input Expression"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="3 * 4 + 5"
            sx={{ 
              '& input': { 
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Output Type"
            value={outputType}
            onChange={(e) => setOutputType(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="value">Evaluate Value</option>
            <option value="postfix">Generate Postfix</option>
            <option value="prefix">Generate Prefix</option>
            <option value="three-address">Three Address Code</option>
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlayArrow />}
          onClick={() => onAnalyze({ grammar, expression, outputType })}
          sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
        >
          Generate SDT
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Clear />}
          onClick={() => {
            setGrammar('');
            setExpression('');
            onClear();
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}

// Symbol Table Solver
function SymbolTableSolver({ onAnalyze, onClear }) {
  const [code, setCode] = useState('int x;\nfloat y;\nvoid foo(int a) {\n    int b;\n    {\n        int c;\n    }\n}');

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={12}
        label="Source Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="int x;&#10;void foo() { ... }"
        sx={{ 
          '& textarea': { 
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem'
          }
        }}
      />

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlayArrow />}
          onClick={() => onAnalyze({ code })}
          sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
        >
          Build Symbol Table
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Clear />}
          onClick={() => {
            setCode('');
            onClear();
          }}
        >
          Clear
        </Button>
      </Box>

      {/* Info */}
      <Alert severity="info" sx={{ mt: 2 }}>
        The solver will analyze scope nesting, detect redeclarations, and calculate memory offsets.
      </Alert>
    </Box>
  );
}

// Attributes Solver
function AttributesSolver({ onAnalyze, onClear }) {
  const [grammar, setGrammar] = useState('D → T L { L.type = T.type }\nT → int { T.type = integer }\nL → L, id { addtype(id, L.type) }');
  const [input, setInput] = useState('int x, y, z');

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Attribute Grammar"
            value={grammar}
            onChange={(e) => setGrammar(e.target.value)}
            placeholder="D → T L { L.type = T.type }&#10;..."
            sx={{ 
              '& textarea': { 
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem'
              }
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Input String"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="int x, y, z"
            sx={{ 
              '& input': { 
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem'
              }
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlayArrow />}
          onClick={() => onAnalyze({ grammar, input })}
          sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
        >
          Evaluate Attributes
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Clear />}
          onClick={() => {
            setGrammar('');
            setInput('');
            onClear();
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}

// Semantic Actions Solver
function SemanticActionsSolver({ onAnalyze, onClear }) {
  const [production, setProduction] = useState('S → id = E ;');
  const [code, setCode] = useState('x = y + 5;');
  const [symbolTable, setSymbolTable] = useState('x: int\ny: int');

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Grammar Production"
            value={production}
            onChange={(e) => setProduction(e.target.value)}
            placeholder="S → id = E ;"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Symbol Table (pre-populated)"
            value={symbolTable}
            onChange={(e) => setSymbolTable(e.target.value)}
            placeholder="x: int&#10;y: int"
            sx={{ 
              '& textarea': { 
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem'
              }
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Code to Analyze"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="x = y + 5;"
            sx={{ 
              '& textarea': { 
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem'
              }
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlayArrow />}
          onClick={() => onAnalyze({ production, code, symbolTable })}
          sx={{ bgcolor: '#00acc1', '&:hover': { bgcolor: '#00838f' } }}
        >
          Execute Semantic Actions
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Clear />}
          onClick={() => {
            setProduction('');
            setCode('');
            setSymbolTable('');
            onClear();
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}

// Generic Solver Fallback
function GenericSolver({ onAnalyze, onClear }) {
  const [input, setInput] = useState('');

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={10}
        label="Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your input here..."
      />
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<PlayArrow />}
          onClick={() => onAnalyze({ input })}
        >
          Analyze
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Clear />}
          onClick={() => {
            setInput('');
            onClear();
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}

// Results Display Component
function ResultsDisplay({ result, topic }) {
  if (!result) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ my: 2 }} />
      
      {/* Status Banner */}
      <Alert 
        severity={result.success ? "success" : "error"}
        icon={result.success ? <CheckCircle /> : <ErrorIcon />}
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {result.success ? '✅ Analysis Complete' : '❌ Analysis Failed'}
        </Typography>
        {result.message && (
          <Typography variant="body2">{result.message}</Typography>
        )}
      </Alert>

      {/* Topic-Specific Results */}
      {topic === 'type-checking' && result.typeAnalysis && (
        <TypeCheckingResults data={result.typeAnalysis} />
      )}
      
      {topic === 'sdt' && result.sdtResult && (
        <SDTResults data={result.sdtResult} />
      )}
      
      {topic === 'symbol-table' && result.symbolTable && (
        <SymbolTableResults data={result.symbolTable} />
      )}
      
      {topic === 'attributes' && result.attributes && (
        <AttributesResults data={result.attributes} />
      )}
      
      {topic === 'semantic-actions' && result.actions && (
        <SemanticActionsResults data={result.actions} />
      )}

      {/* Errors */}
      {result.errors && result.errors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} color="error" gutterBottom>
            Errors Detected:
          </Typography>
          {result.errors.map((err, idx) => (
            <Alert key={idx} severity="error" sx={{ mb: 1 }}>
              {err.line && `Line ${err.line}: `}{err.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} color="warning.main" gutterBottom>
            Warnings:
          </Typography>
          {result.warnings.map((warn, idx) => (
            <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
              {warn.line && `Line ${warn.line}: `}{warn.message}
            </Alert>
          ))}
        </Box>
      )}
    </Box>
  );
}

// Type Checking Results
function TypeCheckingResults({ data }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Type Analysis Results
      </Typography>

      {/* Expression Tree */}
      {data.expressionTree && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography fontWeight={600}>Expression Type Tree</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {data.expressionTree}
              </pre>
            </Paper>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Type Table */}
      {data.types && data.types.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#00acc1' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Expression</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Coercion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.types.map((type, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{type.expression}</TableCell>
                  <TableCell>
                    <Chip label={type.type} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    {type.coercion ? (
                      <Chip label={type.coercion} size="small" color="warning" />
                    ) : (
                      <Chip label="None" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

// SDT Results
function SDTResults({ data }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        SDT Evaluation Results
      </Typography>

      {/* Parse Steps */}
      {data.parseSteps && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography fontWeight={600}>Parse Tree Construction</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stepper orientation="vertical">
              {data.parseSteps.map((step, idx) => (
                <Step key={idx} active completed>
                  <StepLabel>
                    {step.production}
                  </StepLabel>
                  <Box sx={{ ml: 4, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {step.action}
                    </Typography>
                    {step.value && (
                      <Chip label={`Value: ${step.value}`} size="small" sx={{ mt: 1 }} />
                    )}
                  </Box>
                </Step>
              ))}
            </Stepper>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Final Output */}
      {data.output && (
        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Final Output:
          </Typography>
          <Typography variant="h5" fontFamily="monospace" color="primary">
            {data.output}
          </Typography>
        </Paper>
      )}

      {/* Generated Code */}
      {data.generatedCode && (
        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Generated Code:
          </Typography>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {data.generatedCode}
          </pre>
        </Paper>
      )}
    </Box>
  );
}

// Symbol Table Results
function SymbolTableResults({ data }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Symbol Table
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#00acc1' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Scope</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Offset</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.entries && data.entries.map((entry, idx) => (
              <TableRow 
                key={idx}
                sx={{ 
                  bgcolor: getScopeColor(entry.scope),
                  '&:hover': { bgcolor: 'rgba(0, 172, 193, 0.1)' }
                }}
              >
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {entry.name}
                </TableCell>
                <TableCell>
                  <Chip label={entry.type} size="small" />
                </TableCell>
                <TableCell>{entry.scope}</TableCell>
                <TableCell>{entry.offset}</TableCell>
                <TableCell>{entry.size}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Scope Hierarchy */}
      {data.scopeHierarchy && (
        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Scope Hierarchy:
          </Typography>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {data.scopeHierarchy}
          </pre>
        </Paper>
      )}
    </Box>
  );
}

// Attributes Results
function AttributesResults({ data }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Attribute Evaluation
      </Typography>

      {/* Dependency Graph */}
      {data.dependencyGraph && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f0f7ff' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Dependency Graph:
          </Typography>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {data.dependencyGraph}
          </pre>
        </Paper>
      )}

      {/* Evaluation Order */}
      {data.evaluationOrder && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography fontWeight={600}>Evaluation Order</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stepper orientation="vertical">
              {data.evaluationOrder.map((step, idx) => (
                <Step key={idx} active completed>
                  <StepLabel>
                    Step {idx + 1}: {step.attribute}
                  </StepLabel>
                  <Box sx={{ ml: 4, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {step.computation}
                    </Typography>
                    <Chip 
                      label={`${step.type} attribute`} 
                      size="small" 
                      color={step.type === 'synthesized' ? 'primary' : 'secondary'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Step>
              ))}
            </Stepper>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}

// Semantic Actions Results
function SemanticActionsResults({ data }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Semantic Actions Execution
      </Typography>

      {/* Action Steps */}
      {data.steps && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#00acc1' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Step</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.steps.map((step, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {step.action}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={step.result} 
                      size="small"
                      color={step.success ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Generated Code */}
      {data.generatedCode && (
        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Generated Intermediate Code:
          </Typography>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {data.generatedCode}
          </pre>
        </Paper>
      )}
    </Box>
  );
}

// Helper Functions
function getTopicDisplayName(topic) {
  const names = {
    'type-checking': 'Type Checking',
    'sdt': 'Syntax-Directed Translation',
    'attributes': 'Attribute Grammars',
    'symbol-table': 'Symbol Table',
    'semantic-actions': 'Semantic Actions'
  };
  return names[topic] || topic;
}

function getTopicDescription(topic) {
  const descriptions = {
    'type-checking': 'Analyze expressions for type compatibility and coercion requirements',
    'sdt': 'Evaluate expressions using syntax-directed translation rules',
    'symbol-table': 'Build symbol tables with scope management and offset calculation',
    'attributes': 'Evaluate synthesized and inherited attributes in parse trees',
    'semantic-actions': 'Execute semantic actions and generate intermediate code'
  };
  return descriptions[topic] || 'Analyze semantic properties of your code';
}

function getScopeColor(scope) {
  const colors = {
    'global': 'rgba(76, 175, 80, 0.1)',
    '0': 'rgba(76, 175, 80, 0.1)',
    '1': 'rgba(33, 150, 243, 0.1)',
    '2': 'rgba(255, 152, 0, 0.1)',
  };
  return colors[scope] || 'transparent';
}

function getMockResultForTopic(topic, input) {
  // Mock results for demonstration
  const mockResults = {
    'type-checking': {
      success: true,
      message: 'Type checking completed successfully',
      typeAnalysis: {
        expressionTree: `       + (float)
      / \\
    x    * (float)
  (int)  / \\
        y   2
     (float) (int→float)`,
        types: [
          { expression: 'x', type: 'int', coercion: null },
          { expression: 'y', type: 'float', coercion: null },
          { expression: '2', type: 'int', coercion: 'int → float' },
          { expression: 'y * 2', type: 'float', coercion: null },
          { expression: 'x + (y * 2)', type: 'float', coercion: 'int → float for x' }
        ]
      }
    },
    'sdt': {
      success: true,
      message: 'SDT evaluation completed',
      sdtResult: {
        output: '17',
        parseSteps: [
          { production: 'F → 3', action: 'F.val = 3', value: '3' },
          { production: 'T → F', action: 'T.val = F.val', value: '3' },
          { production: 'F → 4', action: 'F.val = 4', value: '4' },
          { production: 'T → T * F', action: 'T.val = 3 * 4', value: '12' },
          { production: 'E → T', action: 'E.val = T.val', value: '12' },
          { production: 'F → 5', action: 'F.val = 5', value: '5' },
          { production: 'T → F', action: 'T.val = F.val', value: '5' },
          { production: 'E → E + T', action: 'E.val = 12 + 5', value: '17' }
        ],
        generatedCode: 't1 = 3 * 4\nt2 = t1 + 5\nresult = t2'
      }
    },
    'symbol-table': {
      success: true,
      message: 'Symbol table constructed successfully',
      symbolTable: {
        entries: [
          { name: 'x', type: 'int', scope: 'global', offset: '0', size: '4' },
          { name: 'y', type: 'float', scope: 'global', offset: '4', size: '4' },
          { name: 'foo', type: 'function(int)→void', scope: 'global', offset: '-', size: '-' },
          { name: 'a', type: 'int', scope: 'foo', offset: '0', size: '4' },
          { name: 'b', type: 'int', scope: 'foo', offset: '4', size: '4' }
        ],
        scopeHierarchy: `global
  ├── x: int
  ├── y: float
  └── foo: function
       ├── a: int (param)
       └── b: int (local)`
      }
    },
    'attributes': {
      success: true,
      message: 'Attributes evaluated successfully',
      attributes: {
        dependencyGraph: `T.type ──→ L.type
           ↑
        (synthesized)
           ↓
      (inherited)`,
        evaluationOrder: [
          { 
            attribute: 'T.type', 
            computation: 'T.type = integer (from T → int)', 
            type: 'synthesized' 
          },
          { 
            attribute: 'L.type', 
            computation: 'L.type = T.type = integer (inherited from D)', 
            type: 'inherited' 
          },
          { 
            attribute: 'L1.type', 
            computation: 'L1.type = L.type = integer (inherited)', 
            type: 'inherited' 
          }
        ]
      }
    },
    'semantic-actions': {
      success: true,
      message: 'Semantic actions executed successfully',
      actions: {
        steps: [
          { action: 'lookup(x) in symbol table', result: 'Found: x (int)', success: true },
          { action: 'lookup(y) in symbol table', result: 'Found: y (int)', success: true },
          { action: 'Type check: y + 5', result: 'int + int = int', success: true },
          { action: 'Type check: x = result', result: 'int = int ✓', success: true },
          { action: 'Generate code', result: 'MOV x, t1', success: true }
        ],
        generatedCode: 't1 = y + 5\nMOV x, t1'
      }
    }
  };

  return mockResults[topic] || { success: false, message: 'Unknown topic' };
}

export default TopicSpecificSemanticSolver;