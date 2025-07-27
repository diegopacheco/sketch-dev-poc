import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const AssignToTeam: React.FC = () => {
  const { members, teams, assignMemberToTeam, removeMemberFromTeam } = useAppContext();
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember && selectedTeam) {
      await assignMemberToTeam(selectedMember, selectedTeam);
      setSelectedMember('');
      setSelectedTeam('');
    }
  };

  const handleRemove = async (memberId: string) => {
    await removeMemberFromTeam(memberId);
  };

  const unassignedMembers = members.filter(member => !member.team_id);
  const assignedMembers = members.filter(member => member.team_id);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2>Assign to Team</h2>
      
      <div style={{ marginBottom: '3rem' }}>
        <h3>Assign Member to Team</h3>
        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Member</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">Choose a member...</option>
              {unassignedMembers.map(member => (
                <option key={member.id} value={member.id.toString()}>{member.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">Choose a team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id.toString()}>{team.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Assign to Team
          </button>
        </form>
      </div>

      <div>
        <h3>Current Team Assignments</h3>
        {assignedMembers.length === 0 ? (
          <p style={{ color: '#666' }}>No members assigned to teams yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assignedMembers.map(member => {
              const team = teams.find(t => t.id === member.team_id);
              return (
                <div key={member.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                      <div style={{ color: '#007bff', fontSize: '0.9rem' }}>Team: {team?.name}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(member.id.toString())}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Remove from Team
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignToTeam;
