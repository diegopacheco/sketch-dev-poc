import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Navigation';

const NavigationWithRouter = () => (
  <BrowserRouter>
    <Navigation />
  </BrowserRouter>
);

describe('Navigation', () => {
  it('should render all navigation links', () => {
    render(<NavigationWithRouter />);

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add team member/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create team/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /assign to team/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /give feedback/i })).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    render(<NavigationWithRouter />);

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /add team member/i })).toHaveAttribute('href', '/add-member');
    expect(screen.getByRole('link', { name: /create team/i })).toHaveAttribute('href', '/create-team');
    expect(screen.getByRole('link', { name: /assign to team/i })).toHaveAttribute('href', '/assign-team');
    expect(screen.getByRole('link', { name: /give feedback/i })).toHaveAttribute('href', '/give-feedback');
  });

  it('should have proper styling', () => {
    render(<NavigationWithRouter />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveStyle({
      padding: '1rem',
      borderBottom: '1px solid #ccc'
    });
  });
});
