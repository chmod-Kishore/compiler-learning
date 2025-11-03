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

export default api;