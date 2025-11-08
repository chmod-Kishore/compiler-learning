// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import HomePage from './components/HomePage';
import LexicalAnalysis from './components/LexicalAnalysis';
import SyntaxAnalysis from './components/SyntaxAnalysis';
import SemanticAnalysis from './components/SemanticAnalysis';
import IntermediateCode from './components/IntermediateCode';
import SubsectionTheory from './components/SubsectionTheory';
import Solver from './components/Solver';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#f093fb',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lexical" element={<LexicalAnalysis />} />
          <Route path="/syntax" element={<SyntaxAnalysis />} />
          <Route path="/semantic" element={<SemanticAnalysis />} />
          <Route path="/intermediate" element={<IntermediateCode />} />
          <Route path="/solver" element={<Solver />} />
          <Route path="/lexical/subsection/:id" element={<SubsectionTheory />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;