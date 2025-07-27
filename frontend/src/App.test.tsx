import React from 'react';
import { render, screen } from './test-utils/test-utils';
import App from './App';

test('renders coaching application dashboard', () => {
  render(<App />);
  const dashboardElement = screen.getByText(/Coaching Application Dashboard/i);
  expect(dashboardElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByText('Add Team Member')).toBeInTheDocument();
  expect(screen.getByText('Create Team')).toBeInTheDocument();
  expect(screen.getByText('Assign to Team')).toBeInTheDocument();
  expect(screen.getByText('Give Feedback')).toBeInTheDocument();
});

test('renders dashboard stats', () => {
  render(<App />);
  expect(screen.getByText('Team Members')).toBeInTheDocument();
  expect(screen.getByText('Teams')).toBeInTheDocument();
  expect(screen.getByText('Feedback')).toBeInTheDocument();
});

