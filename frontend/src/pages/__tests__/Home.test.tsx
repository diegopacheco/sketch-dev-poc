import React from 'react';
import { render, screen } from '../../test-utils/test-utils';
import { AppProvider } from '../../context/AppContext';
import Home from '../Home';

const HomeWithProvider = () => (
  <AppProvider>
    <Home />
  </AppProvider>
);

describe('Home', () => {
  it('should render dashboard heading', () => {
    render(<HomeWithProvider />);

    expect(screen.getByRole('heading', { name: /coaching application dashboard/i })).toBeInTheDocument();
  });

  it('should render stat cards', () => {
    render(<HomeWithProvider />);

    expect(screen.getByText(/team members/i)).toBeInTheDocument();
    expect(screen.getByText(/teams/i)).toBeInTheDocument();
    expect(screen.getByText(/feedback/i)).toBeInTheDocument();
  });

  it('should show initial counts as 0', () => {
    render(<HomeWithProvider />);

    const countElements = screen.getAllByText('0');
    expect(countElements).toHaveLength(3);
  });

  it('should render overview sections', () => {
    render(<HomeWithProvider />);

    expect(screen.getByRole('heading', { name: /teams overview/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /recent members/i })).toBeInTheDocument();
  });

  it('should show empty state messages', () => {
    render(<HomeWithProvider />);

    expect(screen.getByText(/no teams created yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no members added yet/i)).toBeInTheDocument();
  });

  it('should render quick action links', () => {
    render(<HomeWithProvider />);

    expect(screen.getByRole('link', { name: /add new member/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create new team/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /give feedback/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create your first team/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add your first member/i })).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    render(<HomeWithProvider />);

    expect(screen.getByRole('link', { name: /add new member/i })).toHaveAttribute('href', '/add-member');
    expect(screen.getByRole('link', { name: /create new team/i })).toHaveAttribute('href', '/create-team');
    expect(screen.getByRole('link', { name: /give feedback/i })).toHaveAttribute('href', '/give-feedback');
  });

  it('should render stat cards with proper styling', () => {
    render(<HomeWithProvider />);

    const teamMembersCard = screen.getByText(/team members/i).closest('div');
    const teamsCard = screen.getByText(/teams/i).closest('div');
    const feedbackCard = screen.getByText(/feedback/i).closest('div');

    expect(teamMembersCard).toHaveStyle({
      padding: '1.5rem',
      border: '1px solid #ddd'
    });
    expect(teamsCard).toHaveStyle({
      padding: '1.5rem',
      border: '1px solid #ddd'
    });
    expect(feedbackCard).toHaveStyle({
      padding: '1.5rem',
      border: '1px solid #ddd'
    });
  });
});
