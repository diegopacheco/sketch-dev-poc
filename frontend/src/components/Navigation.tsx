import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav style={{
      padding: '1rem 2rem',
      borderBottom: '1px solid #ccc',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      backgroundColor: '#f8f9fa',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        marginRight: '1rem'
      }}>
        <img 
          src="/logo-app.svg" 
          alt="Coaching App" 
          style={{ height: '32px' }}
        />
      </Link>
      
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
      <Link to="/feedback-list" style={{
        textDecoration: 'none',
        color: '#007bff'
      }}>View Feedback</Link>
      <Link to="/team-management" style={{
        textDecoration: 'none',
        color: '#007bff'
      }}>Manage Teams</Link>
    </nav>
  );
};

export default Navigation;
