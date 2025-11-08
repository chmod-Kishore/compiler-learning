// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;