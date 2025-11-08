import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getLL1ParserProblems } from '../services/api';
import ParseTableEditor from './ParseTableEditor';
import ParsingSimulator from './ParsingSimulator';
import ConflictDetector from './ConflictDetector';

const LL1ParserProblems = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProblems(currentLevel);
  }, [currentLevel]);

  const loadProblems = async (level) => {
    setLoading(true);
    setError(null);
    setCurrentProblemIndex(0);
    try {
      const data = await getLL1ParserProblems(level);
      setProblems(data);
    } catch (err) {
      setError('Failed to load problems. Please try again.');
      console.error('Error loading problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (event, newValue) => {
    setCurrentLevel(newValue);
  };

  const handlePreviousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };

  const renderProblemContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      );
    }

    if (problems.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 4 }}>
          No problems available for this level.
        </Alert>
      );
    }

    const currentProblem = problems[currentProblemIndex];

    switch (currentLevel) {
      case 1:
        return <ParseTableEditor problem={currentProblem} />;
      case 2:
        return <ParsingSimulator problem={currentProblem} />;
      case 3:
        return <ConflictDetector problem={currentProblem} />;
      default:
        return null;
    }
  };

  const getLevelInfo = (level) => {
    switch (level) {
      case 1:
        return {
          title: 'Level 1: Parse Table Construction',
          description: 'Build LL(1) parse tables by filling in entries for each non-terminal and terminal combination.',
          color: '#4caf50'
        };
      case 2:
        return {
          title: 'Level 2: Parsing Simulation',
          description: 'Simulate the LL(1) parsing process step-by-step, tracking the stack, input, and actions.',
          color: '#2196f3'
        };
      case 3:
        return {
          title: 'Level 3: Conflict Detection',
          description: 'Identify whether grammars are LL(1) and detect types of conflicts (FIRST/FIRST or FIRST/FOLLOW).',
          color: '#f44336'
        };
      default:
        return { title: '', description: '', color: '#757575' };
    }
  };

  const levelInfo = getLevelInfo(currentLevel);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        LL(1) Parser - Practice Problems
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Test your understanding of LL(1) parsing through three levels of interactive practice problems.
      </Typography>

      {/* Level Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentLevel}
          onChange={handleLevelChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontSize: '1rem', fontWeight: 500 }
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="🟢" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                Level 1: Parse Table
              </Box>
            }
            value={1}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="🔵" size="small" sx={{ bgcolor: '#2196f3', color: 'white' }} />
                Level 2: Parsing Simulation
              </Box>
            }
            value={2}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="🔴" size="small" sx={{ bgcolor: '#f44336', color: 'white' }} />
                Level 3: Conflict Detection
              </Box>
            }
            value={3}
          />
        </Tabs>
      </Paper>

      {/* Level Description */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: `${levelInfo.color}10`, borderLeft: `4px solid ${levelInfo.color}` }}>
        <Typography variant="h6" gutterBottom sx={{ color: levelInfo.color, fontWeight: 'bold' }}>
          {levelInfo.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {levelInfo.description}
        </Typography>
      </Paper>

      {/* Problem Navigation */}
      {!loading && problems.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={handlePreviousProblem}
              disabled={currentProblemIndex === 0}
              startIcon={<ArrowBackIcon />}
            >
              Previous
            </Button>
            <Button disabled>
              Problem {currentProblemIndex + 1} of {problems.length}
            </Button>
            <Button
              onClick={handleNextProblem}
              disabled={currentProblemIndex === problems.length - 1}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          </ButtonGroup>

          <Typography variant="body2" color="text.secondary">
            <strong>Type:</strong> {problems[currentProblemIndex]?.type}
          </Typography>
        </Box>
      )}

      {/* Problem Content */}
      <Paper sx={{ p: 3 }}>
        {renderProblemContent()}
      </Paper>

      {/* Footer Info */}
      <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>💡 Tips:</strong>
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Use the hints if you're stuck
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Try to complete the problem before viewing the solution
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Pay attention to ε-productions and FOLLOW sets
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • The feedback will help you understand your mistakes
        </Typography>
      </Box>
    </Box>
  );
};

export default LL1ParserProblems;
