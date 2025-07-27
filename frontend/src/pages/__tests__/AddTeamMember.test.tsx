import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import AddTeamMember from '../AddTeamMember';
import userEvent from '@testing-library/user-event';

const AddTeamMemberWithProvider = () => (
  <AppProvider>
    <AddTeamMember />
  </AppProvider>
);

global.alert = jest.fn();

describe('AddTeamMember', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<AddTeamMemberWithProvider />);

    expect(screen.getByRole('heading', { name: /add team member/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/picture url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add team member/i })).toBeInTheDocument();
  });

  it('should show required fields', () => {
    render(<AddTeamMemberWithProvider />);

    expect(screen.getByLabelText(/name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/picture url/i)).not.toBeRequired();
  });

  it('should add team member with valid data', async () => {
    const user = userEvent.setup();
    render(<AddTeamMemberWithProvider />);

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/picture url/i), 'https://example.com/john.jpg');
    
    await user.click(screen.getByRole('button', { name: /add team member/i }));

    expect(global.alert).toHaveBeenCalledWith('Team member added successfully!');
  });

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup();
    render(<AddTeamMemberWithProvider />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const pictureInput = screen.getByLabelText(/picture url/i) as HTMLInputElement;

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(pictureInput, 'https://example.com/john.jpg');
    
    await user.click(screen.getByRole('button', { name: /add team member/i }));

    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(pictureInput.value).toBe('');
  });

  it('should not submit with missing required fields', async () => {
    const user = userEvent.setup();
    render(<AddTeamMemberWithProvider />);

    await user.click(screen.getByRole('button', { name: /add team member/i }));

    expect(global.alert).not.toHaveBeenCalled();
  });

  it('should validate email format', () => {
    render(<AddTeamMemberWithProvider />);
    
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should validate picture URL format', () => {
    render(<AddTeamMemberWithProvider />);
    
    const pictureInput = screen.getByLabelText(/picture url/i);
    expect(pictureInput).toHaveAttribute('type', 'url');
  });
});
