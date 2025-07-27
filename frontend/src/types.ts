export interface TeamMember {
  id: string;
  name: string;
  email: string;
  picture: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  memberIds: string[];
}

export interface Feedback {
  id: string;
  content: string;
  targetType: 'team' | 'member';
  targetId: string;
  targetName: string;
  createdAt: Date;
}
