import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Feedback } from '../types';

const FeedbackList: React.FC = () => {
  const { feedback, members, teams, loading } = useAppContext();
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'member' | 'team'>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  useEffect(() => {
    let filtered = feedback;

    if (filterType !== 'all') {
      filtered = feedback.filter(fb => fb.target_type === filterType);
    }

    if (selectedTarget) {
      filtered = filtered.filter(fb => fb.target_id.toString() === selectedTarget);
    }

    setFilteredFeedback(filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  }, [feedback, filterType, selectedTarget]);

  const getTargetOptions = () => {
    if (filterType === 'member') {
      return members.map(member => ({ id: member.id, name: member.name }));
    } else if (filterType === 'team') {
      return teams.map(team => ({ id: team.id, name: team.name }));
    }
    return [];
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2>Loading feedback...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h2>All Feedback</h2>
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Filter by Type</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as 'all' | 'member' | 'team');
              setSelectedTarget('');
            }}
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="all">All Feedback</option>
            <option value="member">Team Members</option>
            <option value="team">Teams</option>
          </select>
        </div>

        {filterType !== 'all' && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Filter by {filterType === 'member' ? 'Member' : 'Team'}
            </label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '200px'
              }}
            >
              <option value="">All {filterType === 'member' ? 'Members' : 'Teams'}</option>
              {getTargetOptions().map(option => (
                <option key={option.id} value={option.id.toString()}>{option.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button
            onClick={() => {
              setFilterType('all');
              setSelectedTarget('');
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Showing {filteredFeedback.length} of {feedback.length} feedback entries
        </p>
      </div>

      {filteredFeedback.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ color: '#666' }}>No feedback found</h3>
          <p style={{ color: '#888' }}>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredFeedback.map(fb => (
            <div key={fb.id} style={{
              padding: '1.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: fb.target_type === 'team' ? '#28a745' : '#007bff',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    marginRight: '1rem'
                  }}>
                    {fb.target_type}
                  </span>
                  <strong style={{ color: '#333', fontSize: '1.1rem' }}>
                    {fb.target_name}
                  </strong>
                </div>
                <small style={{ color: '#666' }}>
                  {new Date(fb.created_at).toLocaleDateString()} {new Date(fb.created_at).toLocaleTimeString()}
                </small>
              </div>
              <p style={{ 
                margin: 0, 
                lineHeight: '1.6', 
                color: '#333',
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                {fb.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
