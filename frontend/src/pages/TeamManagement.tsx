import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const TeamManagement: React.FC = () => {
  const { teams, members, loading, removeMemberFromTeam, deleteTeam } = useAppContext();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getTeamMembers = (teamId: string) => {
    return members.filter(member => member.team_id?.toString() === teamId);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from their team?`)) {
      await removeMemberFromTeam(memberId);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (confirmDelete === teamId) {
      const teamMembers = getTeamMembers(teamId);
      if (teamMembers.length > 0) {
        showToast('Cannot delete team with members. Remove all members first.', 'error');
        return;
      }
      await deleteTeam(teamId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(teamId);
      setTimeout(() => setConfirmDelete(null), 5000);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2>Loading teams...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h2>Team Management</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Manage your teams and their members. You can remove members from teams or delete entire teams.
      </p>
      
      {teams.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ color: '#666' }}>No teams found</h3>
          <p style={{ color: '#888' }}>Create your first team to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {teams.map(team => {
            const teamMembers = getTeamMembers(team.id.toString());
            return (
              <div key={team.id} style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                backgroundColor: '#fff',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {team.logo && (
                      <img
                        src={team.logo}
                        alt={team.name}
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '8px', 
                          objectFit: 'cover' 
                        }}
                      />
                    )}
                    <div>
                      <h3 style={{ margin: 0, color: '#333' }}>{team.name}</h3>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteTeam(team.id.toString(), team.name)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: confirmDelete === team.id.toString() ? '#dc3545' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    {confirmDelete === team.id.toString() ? 'Click to Confirm Delete' : 'Delete Team'}
                  </button>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                  {teamMembers.length === 0 ? (
                    <p style={{ 
                      color: '#888', 
                      fontStyle: 'italic', 
                      textAlign: 'center',
                      margin: 0,
                      padding: '2rem' 
                    }}>
                      No members assigned to this team
                    </p>
                  ) : (
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: '#333' }}>Team Members</h4>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        {teamMembers.map(member => (
                          <div key={member.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            backgroundColor: '#fafafa'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {member.picture && (
                                <img
                                  src={member.picture}
                                  alt={member.name}
                                  style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover' 
                                  }}
                                />
                              )}
                              <div>
                                <strong style={{ color: '#333' }}>{member.name}</strong>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>{member.email}</div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveMember(member.id.toString(), member.name)}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#ffc107',
                                color: '#212529',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                              }}
                            >
                              Remove from Team
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {confirmDelete && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, color: '#856404', fontSize: '0.9rem' }}>
            ⚠️ Click "Delete Team" again to confirm deletion
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
