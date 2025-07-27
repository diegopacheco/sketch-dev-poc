export interface TeamMember {
  id: number;
  name: string;
  email: string;
  picture: string;
  team_id?: number;
  team?: Team;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  members?: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: number;
  content: string;
  target_type: 'team' | 'member';
  target_id: number;
  target_name: string;
  created_at: string;
  updated_at: string;
}

// For backward compatibility
export interface LegacyTeamMember {
  id: string;
  name: string;
  email: string;
  picture: string;
  teamId?: string;
}

export interface LegacyTeam {
  id: string;
  name: string;
  logo: string;
  memberIds: string[];
}

export interface LegacyFeedback {
  id: string;
  content: string;
  targetType: 'team' | 'member';
  targetId: string;
  targetName: string;
  createdAt: Date;
}
