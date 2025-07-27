import React from 'react';
import { render, screen } from '../test-utils/test-utils';
import App from '../App';
import userEvent from '@testing-library/user-event';

global.alert = jest.fn();

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full team member workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/coaching application dashboard/i)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /add team member/i }));
    expect(screen.getByRole('heading', { name: /add team member/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/picture url/i), 'https://example.com/john.jpg');
    await user.click(screen.getByRole('button', { name: /add team member/i }));

    expect(global.alert).toHaveBeenCalledWith('Team member added successfully!');

    await user.click(screen.getByRole('link', { name: /home/i }));
    expect(screen.getByText(/coaching application dashboard/i)).toBeInTheDocument();
  });

  it('should complete full team creation workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('link', { name: /create team/i }));
    expect(screen.getByRole('heading', { name: /create team/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/team name/i), 'Development Team');
    await user.type(screen.getByLabelText(/team logo url/i), 'https://example.com/logo.png');
    await user.click(screen.getByRole('button', { name: /create team/i }));

    expect(global.alert).toHaveBeenCalledWith('Team created successfully!');
  });

  it('should navigate between all pages', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: /coaching application dashboard/i })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /add team member/i }));
    expect(screen.getByRole('heading', { name: /add team member/i })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /create team/i }));
    expect(screen.getByRole('heading', { name: /create team/i })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /assign to team/i }));
    expect(screen.getByRole('heading', { name: /assign to team/i })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /give feedback/i }));
    expect(screen.getByRole('heading', { name: /give feedback/i })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /home/i }));
    expect(screen.getByRole('heading', { name: /coaching application dashboard/i })).toBeInTheDocument();
  });

  it('should handle form validation across pages', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('link', { name: /add team member/i }));
    await user.click(screen.getByRole('button', { name: /add team member/i }));
    expect(global.alert).not.toHaveBeenCalled();

    await user.click(screen.getByRole('link', { name: /create team/i }));
    await user.click(screen.getByRole('button', { name: /create team/i }));
    expect(global.alert).not.toHaveBeenCalled();

    await user.click(screen.getByRole('link', { name: /give feedback/i }));
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    expect(global.alert).not.toHaveBeenCalled();
  });

  it('should show consistent navigation across all pages', async () => {
    const user = userEvent.setup();
    render(<App />);

    const checkNavigation = () => {
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add team member/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /create team/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /assign to team/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /give feedback/i })).toBeInTheDocument();
    };

    checkNavigation();

    await user.click(screen.getByRole('link', { name: /add team member/i }));
    checkNavigation();

    await user.click(screen.getByRole('link', { name: /create team/i }));
    checkNavigation();

    await user.click(screen.getByRole('link', { name: /assign to team/i }));
    checkNavigation();

    await user.click(screen.getByRole('link', { name: /give feedback/i }));
    checkNavigation();
  });
});
