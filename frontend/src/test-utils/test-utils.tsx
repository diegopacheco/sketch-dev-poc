import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';

interface AllTheProvidersProps {
  children: ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <AppProvider>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </AppProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

export const mockTeamMember = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  picture: 'https://example.com/john.jpg'
};

export const mockTeam = {
  id: '1',
  name: 'Development Team',
  logo: 'https://example.com/logo.png',
  memberIds: []
};

export const mockFeedback = {
  id: '1',
  content: 'Great work!',
  targetType: 'member' as const,
  targetId: '1',
  targetName: 'John Doe',
  createdAt: new Date('2023-01-01')
};
