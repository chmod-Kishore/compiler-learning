// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================================
// EXISTING APIs - KEEP ALL OF THESE
// =====================================================

export const getTheory = async (topic = 'syntax') => {
  const response = await api.get('/theory', {
    params: { topic }
  });
  return response.data;
};

export const getProblems = async () => {
  const response = await api.get('/problems');
  return response.data;
};

export const verifyAnswer = async (problemId, userAnswer) => {
  const response = await api.post('/verify', {
    problemId,
    userAnswer,
  });
  return response.data;
};

export const generateUniversal = async (grammar) => {
  const response = await api.post('/universal', {
    grammar,
  });
  return response.data;
};

export const getLexicalSubsection = async (id) => {
  const response = await api.get(`/lexical/subsection/${id}`);
  return response.data;
};

export const getHelp = async (helpRequest) => {
  const response = await api.post('/helper', helpRequest);
  return response.data;
};

// Left Factoring API Functions
export const getLeftFactoringProblems = async () => {
  const response = await api.get('/left-factoring/problems');
  return response.data;
};

export const verifyLeftFactoringAnswer = async (problemId, userAnswer) => {
  const response = await api.post('/left-factoring/verify', {
    problemId,
    userAnswer,
  });
  return response.data;
};

export const generateLeftFactoring = async (grammar) => {
  const response = await api.post('/left-factoring/generate', {
    grammar,
  });
  return response.data;
};

export const getLeftFactoringHelp = async (helpRequest) => {
  const response = await api.post('/left-factoring/helper', helpRequest);
  return response.data;
};

// First and Follow API Functions
export const getFirstFollowProblems = async () => {
  const response = await api.get('/first-follow/problems');
  return response.data;
};

export const generateFirstFollow = async (grammar) => {
  const response = await api.post('/first-follow/generate', {
    grammar,
  });
  return response.data;
};

export const checkFirstFollowAnswer = async (request) => {
  const response = await api.post('/first-follow/helper', request);
  return response.data;
};

export const getFirstFollowHelp = async (helpRequest) => {
  const response = await api.post('/first-follow/helper', helpRequest);
  return response.data;
};

// LL(1) Parser API Functions
export const getLL1ParserProblems = async (level) => {
  const response = await api.get('/ll1-parser/problems', {
    params: { level }
  });
  return response.data;
};

export const getLL1ParserProblem = async (level, problemNumber) => {
  const response = await api.get('/ll1-parser/problem', {
    params: { level, problemNumber }
  });
  return response.data;
};

export const validateParseTable = async (submission) => {
  const response = await api.post('/ll1-parser/validate-table', submission);
  return response.data;
};

export const validateParsingSteps = async (submission) => {
  const response = await api.post('/ll1-parser/validate-parsing', submission);
  return response.data;
};

export const identifyConflict = async (submission) => {
  const response = await api.post('/ll1-parser/identify-conflict', submission);
  return response.data;
};

// LL(1) Solver API Functions
export const generateParseTable = async (grammar) => {
  const response = await api.post('/ll1-solver/generate-table', {
    grammar,
  });
  return response.data;
};

export const runParser = async (grammar, inputString) => {
  const response = await api.post('/ll1-solver/run-parser', {
    grammar,
    inputString,
  });
  return response.data;
};

export const validateGrammar = async (grammar) => {
  const response = await api.post('/ll1-solver/validate-grammar', {
    grammar,
  });
  return response.data;
};

// LL(1) Helper API Functions
export const analyzeParsingState = async (request) => {
  const response = await api.post('/ll1-helper/analyze', request);
  return response.data;
};

// =====================================================
// EXISTING SEMANTIC ANALYSIS APIs - KEEP THESE
// =====================================================

// Theory
export const getSemanticTheory = async (topic) => {
  const response = await api.get(`/semantic/theory/${topic}`);
  return response.data;
};

// OLD Problems (keep for backward compatibility)
export const getSemanticProblems = async (topic) => {
  const response = await api.get(`/semantic/problems/${topic}`);
  return response.data;
};

export const getSemanticProblem = async (topic, problemNumber) => {
  const response = await api.get(`/semantic/problems/${topic}/${problemNumber}`);
  return response.data;
};

// OLD Validation (keep for backward compatibility)
export const validateTypeChecking = async (submission) => {
  const response = await api.post('/semantic/validate/type-checking', submission);
  return response.data;
};

export const validateSymbolTable = async (submission) => {
  const response = await api.post('/semantic/validate/symbol-table', submission);
  return response.data;
};

export const validateSDT = async (submission) => {
  const response = await api.post('/semantic/validate/sdt', submission);
  return response.data;
};

// OLD Analyzer (keep for backward compatibility)
export const analyzeSemanticCode = async (request) => {
  const response = await api.post('/semantic/analyze', request);
  return response.data;
};

// OLD Helper (keep for backward compatibility)
export const getSemanticHelp = async (helpRequest) => {
  const response = await api.post('/semantic/helper', helpRequest);
  return response.data;
};

// =====================================================
// NEW SEMANTIC ANALYSIS APIs
// =====================================================

// =====================================================
// 1. INTERACTIVE PRACTICE APIs
// =====================================================

/**
 * Get all practice problems for a topic with step-by-step structure
 */
export const getPracticeProblems = async (topic) => {
  const response = await api.get(`/semantic/practice/${topic}/problems`);
  return response.data;
};

/**
 * Validate a specific step of a problem
 */
export const validatePracticeStep = async (problemId, stepNumber, userAnswer, topic) => {
  const response = await api.post('/semantic/practice/validate-step', {
    problemId,
    stepNumber,
    userAnswer,
    topic
  });
  return response.data;
};

/**
 * Get tree visualization data for a problem
 */
export const getTreeVisualization = async (topic, problemId, step = 0) => {
  const response = await api.get(`/semantic/practice/${topic}/problem/${problemId}/tree`, {
    params: { step }
  });
  return response.data;
};

// =====================================================
// 2. TOPIC-SPECIFIC SOLVER APIs
// =====================================================

/**
 * Type Checking Solver
 */
export const solveTypeChecking = async (declarations, expression) => {
  const response = await api.post('/semantic/solver/type-checking', {
    declarations,
    expression
  });
  return response.data;
};

/**
 * SDT Solver
 */
export const solveSDT = async (grammar, expression, outputType) => {
  const response = await api.post('/semantic/solver/sdt', {
    grammar,
    expression,
    outputType
  });
  return response.data;
};

/**
 * Symbol Table Solver
 */
export const solveSymbolTable = async (code) => {
  const response = await api.post('/semantic/solver/symbol-table', {
    code
  });
  return response.data;
};

/**
 * Attributes Solver
 */
export const solveAttributes = async (grammar, input) => {
  const response = await api.post('/semantic/solver/attributes', {
    grammar,
    input
  });
  return response.data;
};

/**
 * Semantic Actions Solver
 */
export const solveSemanticActions = async (production, code, symbolTable) => {
  const response = await api.post('/semantic/solver/semantic-actions', {
    production,
    code,
    symbolTable
  });
  return response.data;
};

// =====================================================
// 3. INTELLIGENT HELPER APIs
// =====================================================

/**
 * Get helper problems for a topic
 */
export const getHelperProblems = async (topic) => {
  const response = await api.get(`/semantic/helper/${topic}/problems`);
  return response.data;
};

/**
 * Compare user answer with expected answer (intelligent comparison)
 */
export const compareAnswer = async (problemId, stepNumber, userAnswer, topic) => {
  const response = await api.post('/semantic/helper/compare', {
    problemId,
    stepNumber,
    userAnswer,
    topic
  });
  return response.data;
};

export default api;