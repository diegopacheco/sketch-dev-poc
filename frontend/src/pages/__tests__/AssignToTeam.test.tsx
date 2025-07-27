import React from 'react';
import { render, screen } from '../../test-utils/test-utils';
import { AppProvider } from '../../context/AppContext';
import AssignToTeam from '../AssignToTeam';
import userEvent from '@testing-library/user-event';

global.alert = jest.fn();

const AssignToTeamWithProvider = () => (
  <AppProvider>
    <AssignToTeam />
  </AppProvider>
);

describe('AssignToTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render heading and form', () => {
    render(<AssignToTeamWithProvider />);

    expect(screen.getByRole('heading', { name: /assign to team/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /assign member to team/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /current team assignments/i, level: 3 })).toBeInTheDocument();
  });

  it('should show form fields', () => {
    render(<AssignToTeamWithProvider />);

    expect(screen.getByLabelText(/select member/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select team/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /assign to team/i })).toBeInTheDocument();
  });

  it('should show empty state when no assignments', () => {
    render(<AssignToTeamWithProvider />);

    expect(screen.getByText(/no members assigned to teams yet/i)).toBeInTheDocument();
  });

  it('should show placeholder options when no data', () => {
    render(<AssignToTeamWithProvider />);

    expect(screen.getByText(/choose a member/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a team/i)).toBeInTheDocument();
  });

  it('should have required form fields', () => {
    render(<AssignToTeamWithProvider />);

    expect(screen.getByLabelText(/select member/i)).toBeRequired();
    expect(screen.getByLabelText(/select team/i)).toBeRequired();
  });

  it('should have correct button styling', () => {
    render(<AssignToTeamWithProvider />);
    
    const button = screen.getByRole('button', { name: /assign to team/i });
    expect(button).toHaveStyle({
      backgroundColor: '#17a2b8',
      color: 'white'
    });
  });

  it('should not submit without selections', async () => {
    const user = userEvent.setup();
    render(<AssignToTeamWithProvider />);

    await user.click(screen.getByRole('button', { name: /assign to team/i }));

    expect(global.alert).not.toHaveBeenCalled();
  });
});
