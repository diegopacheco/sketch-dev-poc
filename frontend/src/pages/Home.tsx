import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { members, teams, feedback, loading } = useAppContext();

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h1>Loading...</h1>
        <p>Loading coaching application data...</p>
      </div>
    );
  }

  const unassignedMembers = members.filter(member => !member.team_id);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1>Coaching Application Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#007bff' }}>Team Members</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#333' }}>{members.length}</p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Total members</p>
          <Link to="/add-member" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9rem' }}>Add new member →</Link>
        </div>
        
        <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#28a745' }}>Teams</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#333' }}>{teams.length}</p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Total teams</p>
          <Link to="/create-team" style={{ color: '#28a745', textDecoration: 'none', fontSize: '0.9rem' }}>Create new team →</Link>
        </div>
        
        <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#6f42c1' }}>Feedback</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: '#333' }}>{feedback.length}</p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Total feedback</p>
          <Link to="/give-feedback" style={{ color: '#6f42c1', textDecoration: 'none', fontSize: '0.9rem' }}>Give feedback →</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div>
          <h3>Teams Overview</h3>
          {teams.length === 0 ? (
            <p style={{ color: '#666' }}>No teams created yet. <Link to="/create-team">Create your first team</Link></p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {teams.map(team => {
                const teamMembers = members.filter(member => member.team_id === team.id);
                return (
                  <div key={team.id} style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      {team.logo && (
                        <img
                          src={team.logo}
                          alt={team.name}
                          style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                      )}
                      <strong>{team.name}</strong>
                    </div>
                    <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                      {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3>Recent Members</h3>
          {members.length === 0 ? (
            <p style={{ color: '#666' }}>No members added yet. <Link to="/add-member">Add your first member</Link></p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {members.slice(-5).reverse().map(member => {
                const team = teams.find(t => t.id === member.team_id);
                return (
                  <div key={member.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}>
                    {member.picture && (
                      <img
                        src={member.picture}
                        alt={member.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <strong>{member.name}</strong>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>{member.email}</div>
                      {team && (
                        <div style={{ color: '#007bff', fontSize: '0.8rem' }}>Team: {team.name}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {unassignedMembers.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Action Needed</h4>
          <p style={{ margin: '0', color: '#856404' }}>
            {unassignedMembers.length} member{unassignedMembers.length !== 1 ? 's' : ''} not assigned to any team.
            <Link to="/assign-team" style={{ marginLeft: '0.5rem', color: '#856404' }}>Assign them now →</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
