import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TeamMember, Team, Feedback } from '../types';

interface AppContextType {
  members: TeamMember[];
  teams: Team[];
  feedback: Feedback[];
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  addTeam: (team: Omit<Team, 'id' | 'memberIds'>) => void;
  assignMemberToTeam: (memberId: string, teamId: string) => void;
  removeMemberFromTeam: (memberId: string) => void;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;
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

  const addMember = (memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: Date.now().toString(),
    };
    setMembers(prev => [...prev, newMember]);
  };

  const addTeam = (teamData: Omit<Team, 'id' | 'memberIds'>) => {
    const newTeam: Team = {
      ...teamData,
      id: Date.now().toString(),
      memberIds: [],
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const assignMemberToTeam = (memberId: string, teamId: string) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, teamId }
        : member
    ));
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, memberIds: [...team.memberIds.filter(id => id !== memberId), memberId] }
        : { ...team, memberIds: team.memberIds.filter(id => id !== memberId) }
    ));
  };

  const removeMemberFromTeam = (memberId: string) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, teamId: undefined }
        : member
    ));
    setTeams(prev => prev.map(team => ({
      ...team,
      memberIds: team.memberIds.filter(id => id !== memberId)
    })));
  };

  const addFeedback = (feedbackData: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setFeedback(prev => [...prev, newFeedback]);
  };

  return (
    <AppContext.Provider value={{
      members,
      teams,
      feedback,
      addMember,
      addTeam,
      assignMemberToTeam,
      removeMemberFromTeam,
      addFeedback,
    }}>
      {children}
    </AppContext.Provider>
  );
};
