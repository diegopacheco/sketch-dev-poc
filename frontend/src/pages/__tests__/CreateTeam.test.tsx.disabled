import React from 'react';
import { render, screen } from '../../test-utils/test-utils';
import CreateTeam from '../CreateTeam';
import userEvent from '@testing-library/user-event';

global.alert = jest.fn();

describe('CreateTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<CreateTeam />);

    expect(screen.getByRole('heading', { name: /create team/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/team name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/team logo url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create team/i })).toBeInTheDocument();
  });

  it('should show required fields', () => {
    render(<CreateTeam />);

    expect(screen.getByLabelText(/team name/i)).toBeRequired();
    expect(screen.getByLabelText(/team logo url/i)).not.toBeRequired();
  });

  it('should create team with valid data', async () => {
    const user = userEvent.setup();
    render(<CreateTeam />);

    await user.type(screen.getByLabelText(/team name/i), 'Development Team');
    await user.type(screen.getByLabelText(/team logo url/i), 'https://example.com/logo.png');
    
    await user.click(screen.getByRole('button', { name: /create team/i }));

    expect(global.alert).toHaveBeenCalledWith('Team created successfully!');
  });

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup();
    render(<CreateTeam />);

    const nameInput = screen.getByLabelText(/team name/i) as HTMLInputElement;
    const logoInput = screen.getByLabelText(/team logo url/i) as HTMLInputElement;

    await user.type(nameInput, 'Development Team');
    await user.type(logoInput, 'https://example.com/logo.png');
    
    await user.click(screen.getByRole('button', { name: /create team/i }));

    expect(nameInput.value).toBe('');
    expect(logoInput.value).toBe('');
  });

  it('should not submit with missing required fields', async () => {
    const user = userEvent.setup();
    render(<CreateTeam />);

    await user.click(screen.getByRole('button', { name: /create team/i }));

    expect(global.alert).not.toHaveBeenCalled();
  });

  it('should validate logo URL format', () => {
    render(<CreateTeam />);
    
    const logoInput = screen.getByLabelText(/team logo url/i);
    expect(logoInput).toHaveAttribute('type', 'url');
  });

  it('should have correct button styling', () => {
    render(<CreateTeam />);
    
    const button = screen.getByRole('button', { name: /create team/i });
    expect(button).toHaveStyle({
      backgroundColor: '#28a745',
      color: 'white'
    });
  });
});
