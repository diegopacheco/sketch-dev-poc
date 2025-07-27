import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav style={{
      padding: '1rem',
      borderBottom: '1px solid #ccc',
      marginBottom: '2rem',
      display: 'flex',
      gap: '2rem',
      backgroundColor: '#f8f9fa'
    }}>
      <Link to="/" style={{
        textDecoration: 'none',
        color: '#007bff',
        fontWeight: 'bold'
      }}>Home</Link>
      <Link to="/add-member" style={{
        textDecoration: 'none',
        color: '#007bff'
      }}>Add Team Member</Link>
      <Link to="/create-team" style={{
        textDecoration: 'none',
        color: '#007bff'
      }}>Create Team</Link>
      <Link to="/assign-team" style={{
        textDecoration: 'none',
        color: '#007bff'
      }}>Assign to Team</Link>
      <Link to="/give-feedback" style={{
        textDecoration: 'none',
        color: '#007bff'
      }}>Give Feedback</Link>
    </nav>
  );
};

export default Navigation;
