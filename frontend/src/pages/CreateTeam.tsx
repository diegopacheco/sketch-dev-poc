import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const CreateTeam: React.FC = () => {
  const { addTeam } = useAppContext();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      addTeam({ name, logo });
      setName('');
      setLogo('');
      alert('Team created successfully!');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
      <h2>Create Team</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Team Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Team Logo URL</label>
          <input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://example.com/logo.png"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Create Team
        </button>
      </form>
    </div>
  );
};

export default CreateTeam;
