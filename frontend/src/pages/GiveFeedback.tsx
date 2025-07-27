import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const GiveFeedback: React.FC = () => {
  const { members, teams, feedback, addFeedback } = useAppContext();
  const [targetType, setTargetType] = useState<'team' | 'member'>('member');
  const [targetId, setTargetId] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetId && content) {
      await addFeedback({
        content,
        target_type: targetType,
        target_id: parseInt(targetId)
      });
      setContent('');
      setTargetId('');
    }
  };

  const targets = targetType === 'team' ? teams : members;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2>Give Feedback</h2>
      
      <div style={{ marginBottom: '3rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Feedback Type</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  value="member"
                  checked={targetType === 'member'}
                  onChange={(e) => {
                    setTargetType(e.target.value as 'member');
                    setTargetId('');
                  }}
                />
                Team Member
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  value="team"
                  checked={targetType === 'team'}
                  onChange={(e) => {
                    setTargetType(e.target.value as 'team');
                    setTargetId('');
                  }}
                />
                Team
              </label>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Select {targetType === 'team' ? 'Team' : 'Team Member'}
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="">Choose a {targetType}...</option>
              {targets.map(target => (
                <option key={target.id} value={target.id.toString()}>{target.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Feedback Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              placeholder="Enter your feedback here..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Submit Feedback
          </button>
        </form>
      </div>

      <div>
        <h3>Recent Feedback</h3>
        {feedback.length === 0 ? (
          <p style={{ color: '#666' }}>No feedback submitted yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {feedback.slice().reverse().map(fb => (
              <div key={fb.id} style={{
                padding: '1.5rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <strong style={{ color: '#007bff' }}>
                      {fb.target_type === 'team' ? 'Team' : 'Member'}: {fb.target_name}
                    </strong>
                  </div>
                  <small style={{ color: '#666' }}>
                    {new Date(fb.created_at).toLocaleDateString()} {new Date(fb.created_at).toLocaleTimeString()}
                  </small>
                </div>
                <p style={{ margin: 0, lineHeight: '1.5' }}>{fb.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiveFeedback;
