import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '../AppContext';
import { TeamMember, Team, Feedback } from '../../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  it('should provide initial empty state', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.members).toEqual([]);
    expect(result.current.teams).toEqual([]);
    expect(result.current.feedback).toEqual([]);
  });

  it('should add a team member', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const newMember = {
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/john.jpg'
    };

    act(() => {
      result.current.addMember(newMember);
    });

    expect(result.current.members).toHaveLength(1);
    expect(result.current.members[0]).toMatchObject(newMember);
    expect(result.current.members[0].id).toBeDefined();
  });

  it('should add a team', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const newTeam = {
      name: 'Development Team',
      logo: 'https://example.com/logo.png'
    };

    act(() => {
      result.current.addTeam(newTeam);
    });

    expect(result.current.teams).toHaveLength(1);
    expect(result.current.teams[0]).toMatchObject(newTeam);
    expect(result.current.teams[0].id).toBeDefined();
    expect(result.current.teams[0].memberIds).toEqual([]);
  });

  it('should assign member to team', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addMember({
        name: 'John Doe',
        email: 'john@example.com',
        picture: ''
      });
      result.current.addTeam({
        name: 'Dev Team',
        logo: ''
      });
    });

    const memberId = result.current.members[0].id;
    const teamId = result.current.teams[0].id;

    act(() => {
      result.current.assignMemberToTeam(memberId, teamId);
    });

    expect(result.current.members[0].teamId).toBe(teamId);
    expect(result.current.teams[0].memberIds).toContain(memberId);
  });

  it('should remove member from team', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addMember({
        name: 'John Doe',
        email: 'john@example.com',
        picture: ''
      });
      result.current.addTeam({
        name: 'Dev Team',
        logo: ''
      });
    });

    const memberId = result.current.members[0].id;
    const teamId = result.current.teams[0].id;

    act(() => {
      result.current.assignMemberToTeam(memberId, teamId);
      result.current.removeMemberFromTeam(memberId);
    });

    expect(result.current.members[0].teamId).toBeUndefined();
    expect(result.current.teams[0].memberIds).not.toContain(memberId);
  });

  it('should add feedback', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const newFeedback = {
      content: 'Great work!',
      targetType: 'member' as const,
      targetId: '1',
      targetName: 'John Doe'
    };

    act(() => {
      result.current.addFeedback(newFeedback);
    });

    expect(result.current.feedback).toHaveLength(1);
    expect(result.current.feedback[0]).toMatchObject(newFeedback);
    expect(result.current.feedback[0].id).toBeDefined();
    expect(result.current.feedback[0].createdAt).toBeInstanceOf(Date);
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow('useAppContext must be used within an AppProvider');
    
    consoleSpy.mockRestore();
  });
});
