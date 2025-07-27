import React from 'react';
import { render, screen } from '../../test-utils/test-utils';
import { AppProvider } from '../../context/AppContext';
import GiveFeedback from '../GiveFeedback';
import userEvent from '@testing-library/user-event';

global.alert = jest.fn();

const GiveFeedbackWithProvider = () => (
  <AppProvider>
    <GiveFeedback />
  </AppProvider>
);

describe('GiveFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render heading and form', () => {
    render(<GiveFeedbackWithProvider />);

    expect(screen.getByRole('heading', { name: /give feedback/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /recent feedback/i, level: 3 })).toBeInTheDocument();
  });

  it('should show form fields', () => {
    render(<GiveFeedbackWithProvider />);

    expect(screen.getByText(/feedback type/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /team member/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /team/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /feedback content/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
  });

  it('should have team member selected by default', () => {
    render(<GiveFeedbackWithProvider />);

    expect(screen.getByRole('radio', { name: /team member/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /team/i })).not.toBeChecked();
  });

  it('should change target type when radio button clicked', async () => {
    const user = userEvent.setup();
    render(<GiveFeedbackWithProvider />);

    await user.click(screen.getByRole('radio', { name: /team/i }));

    expect(screen.getByRole('radio', { name: /team/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /team member/i })).not.toBeChecked();
  });

  it('should show empty state when no feedback', () => {
    render(<GiveFeedbackWithProvider />);

    expect(screen.getByText(/no feedback submitted yet/i)).toBeInTheDocument();
  });

  it('should show placeholder text in dropdown', () => {
    render(<GiveFeedbackWithProvider />);

    expect(screen.getByText(/choose a member/i)).toBeInTheDocument();
  });

  it('should update dropdown placeholder when switching types', async () => {
    const user = userEvent.setup();
    render(<GiveFeedbackWithProvider />);

    await user.click(screen.getByRole('radio', { name: /team/i }));

    expect(screen.getByText(/choose a team/i)).toBeInTheDocument();
  });

  it('should have required form fields', () => {
    render(<GiveFeedbackWithProvider />);

    expect(screen.getByRole('combobox')).toBeRequired();
    expect(screen.getByRole('textbox', { name: /feedback content/i })).toBeRequired();
  });

  it('should have correct button styling', () => {
    render(<GiveFeedbackWithProvider />);
    
    const button = screen.getByRole('button', { name: /submit feedback/i });
    expect(button).toHaveStyle({
      backgroundColor: '#6f42c1',
      color: 'white'
    });
  });

  it('should not submit without required fields', async () => {
    const user = userEvent.setup();
    render(<GiveFeedbackWithProvider />);

    await user.click(screen.getByRole('button', { name: /submit feedback/i }));

    expect(global.alert).not.toHaveBeenCalled();
  });
});
