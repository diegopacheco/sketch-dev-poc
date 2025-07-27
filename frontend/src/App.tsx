import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import AddTeamMember from './pages/AddTeamMember';
import CreateTeam from './pages/CreateTeam';
import AssignToTeam from './pages/AssignToTeam';
import GiveFeedback from './pages/GiveFeedback';

function App() {
  return (
    <AppProvider>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-member" element={<AddTeamMember />} />
            <Route path="/create-team" element={<CreateTeam />} />
            <Route path="/assign-team" element={<AssignToTeam />} />
            <Route path="/give-feedback" element={<GiveFeedback />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
