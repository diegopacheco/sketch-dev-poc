import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TeamMember, Team, Feedback } from '../types';
import { apiService } from '../services/api';
import { useToast } from './ToastContext';

interface AppContextType {
  members: TeamMember[];
  teams: Team[];
  feedback: Feedback[];
  loading: boolean;
  addMember: (member: { name: string; email: string; picture: string }) => Promise<void>;
  addTeam: (team: { name: string; logo: string }) => Promise<void>;
  assignMemberToTeam: (memberId: string, teamId: string) => Promise<void>;
  removeMemberFromTeam: (memberId: string) => Promise<void>;
  addFeedback: (feedback: { content: string; target_type: 'team' | 'member'; target_id: number }) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refreshData = async () => {
    try {
      setLoading(true);
      const [membersData, teamsData, feedbackData] = await Promise.all([
        apiService.getTeamMembers(),
        apiService.getTeams(),
        apiService.getFeedback(),
      ]);
      setMembers(membersData);
      setTeams(teamsData);
      setFeedback(feedbackData);
    } catch (error) {
      showToast('Failed to load data', 'error');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addMember = async (memberData: { name: string; email: string; picture: string }) => {
    try {
      await apiService.createTeamMember(memberData);
      await refreshData();
      showToast('Team member added successfully!');
    } catch (error) {
      showToast('Failed to add team member', 'error');
      console.error('Error adding member:', error);
    }
  };

  const addTeam = async (teamData: { name: string; logo: string }) => {
    try {
      await apiService.createTeam(teamData);
      await refreshData();
      showToast('Team created successfully!');
    } catch (error) {
      showToast('Failed to create team', 'error');
      console.error('Error creating team:', error);
    }
  };

  const assignMemberToTeam = async (memberId: string, teamId: string) => {
    try {
      await apiService.assignMemberToTeam(memberId, teamId);
      await refreshData();
      showToast('Member assigned to team successfully!');
    } catch (error) {
      showToast('Failed to assign member to team', 'error');
      console.error('Error assigning member:', error);
    }
  };

  const removeMemberFromTeam = async (memberId: string) => {
    try {
      await apiService.removeMemberFromTeam(memberId);
      await refreshData();
      showToast('Member removed from team successfully!');
    } catch (error) {
      showToast('Failed to remove member from team', 'error');
      console.error('Error removing member:', error);
    }
  };

  const addFeedback = async (feedbackData: { content: string; target_type: 'team' | 'member'; target_id: number }) => {
    try {
      await apiService.createFeedback(feedbackData);
      await refreshData();
      showToast('Feedback submitted successfully!');
    } catch (error) {
      showToast('Failed to submit feedback', 'error');
      console.error('Error adding feedback:', error);
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      await apiService.deleteTeam(teamId);
      await refreshData();
      showToast('Team deleted successfully!');
    } catch (error) {
      showToast('Failed to delete team', 'error');
      console.error('Error deleting team:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      members,
      teams,
      feedback,
      loading,
      addMember,
      addTeam,
      assignMemberToTeam,
      removeMemberFromTeam,
      addFeedback,
      deleteTeam,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
