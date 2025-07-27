import React from 'react';
import { render, screen } from '../test-utils/test-utils';
import App from '../App';

describe('App', () => {
  it('should render the home page by default', () => {
    render(<App />);
    
    expect(screen.getByText(/coaching application dashboard/i)).toBeInTheDocument();
  });

  it('should render navigation', () => {
    render(<App />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add team member/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create team/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /assign to team/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /give feedback/i })).toBeInTheDocument();
  });

  it('should have proper app structure', () => {
    render(<App />);
    
    const appContainer = screen.getByRole('main') || document.querySelector('[style*="minHeight"]');
    expect(appContainer).toHaveStyle({
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    });
  });

  it('should render with AppProvider context', () => {
    render(<App />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render with Router context', () => {
    render(<App />);
    
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });
});
