// src/App.js
import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Container, CssBaseline } from '@mui/material';
import Theory from './components/Theory';
import Problems from './components/Problems';
import Universal from './components/Universal';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Compiler Design Learning App
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="Theory" />
              <Tab label="Problems" />
              <Tab label="Universal Mode" />
            </Tabs>
          </Box>

          <TabPanel value={selectedTab} index={0}>
            <Theory />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <Problems />
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            <Universal />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;