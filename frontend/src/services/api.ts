import { TeamMember, Team, Feedback } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8080/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Team Members API
  async getTeamMembers(): Promise<TeamMember[]> {
    return this.request<TeamMember[]>('/members');
  }

  async createTeamMember(member: { name: string; email: string; picture: string }): Promise<TeamMember> {
    return this.request<TeamMember>('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  }

  async updateTeamMember(id: string, member: Partial<TeamMember>): Promise<TeamMember> {
    return this.request<TeamMember>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    });
  }

  async deleteTeamMember(id: string): Promise<void> {
    return this.request<void>(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  // Teams API
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  async createTeam(team: { name: string; logo: string }): Promise<Team> {
    return this.request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(team),
    });
  }

  async updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    return this.request<Team>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(team),
    });
  }

  async deleteTeam(id: string): Promise<void> {
    return this.request<void>(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Assignments API
  async assignMemberToTeam(memberId: string, teamId: string): Promise<void> {
    return this.request<void>('/assignments', {
      method: 'POST',
      body: JSON.stringify({
        member_id: parseInt(memberId),
        team_id: parseInt(teamId),
      }),
    });
  }

  async removeMemberFromTeam(memberId: string): Promise<void> {
    return this.request<void>(`/assignments/member/${memberId}`, {
      method: 'DELETE',
    });
  }

  async getAssignments(): Promise<TeamMember[]> {
    return this.request<TeamMember[]>('/assignments');
  }

  async getUnassignedMembers(): Promise<TeamMember[]> {
    return this.request<TeamMember[]>('/assignments/unassigned');
  }

  // Feedback API
  async getFeedback(filters?: { target_type?: string; target_id?: string }): Promise<Feedback[]> {
    const params = new URLSearchParams();
    if (filters?.target_type) params.append('target_type', filters.target_type);
    if (filters?.target_id) params.append('target_id', filters.target_id);
    
    const endpoint = `/feedback${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<Feedback[]>(endpoint);
  }

  async createFeedback(feedback: { content: string; target_type: string; target_id: number }): Promise<Feedback> {
    return this.request<Feedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async updateFeedback(id: string, feedback: Partial<Feedback>): Promise<Feedback> {
    return this.request<Feedback>(`/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feedback),
    });
  }

  async deleteFeedback(id: string): Promise<void> {
    return this.request<void>(`/feedback/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
