export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar?: string;
  coverImage?: string;
  ownerId: string;
  owner: CommunityMember;
  members: CommunityMember[];
  rules: string[];
  tags: string[];
  isPublic: boolean;
  isJoinRequestRequired: boolean;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
  stats: CommunityStats;
  settings: CommunitySettings;
}

export interface CommunityMember {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
  };
  role: CommunityRole;
  joinedAt: string;
  isActive: boolean;
  permissions: CommunityPermission[];
}

export interface CommunityStats {
  memberCount: number;
  tournamentCount: number;
  matchCount: number;
  activityScore: number;
  averageRating: number;
}

export interface CommunitySettings {
  allowMemberInvites: boolean;
  allowMemberTournaments: boolean;
  requireApprovalForTournaments: boolean;
  defaultTournamentPrizePool?: number;
  autoKickInactiveDays?: number;
}

export type CommunityRole = 
  | 'owner'
  | 'admin'
  | 'moderator'
  | 'member'
  | 'pending';

export type CommunityPermission = 
  | 'invite_members'
  | 'kick_members'
  | 'create_tournaments'
  | 'manage_tournaments'
  | 'edit_community'
  | 'delete_community'
  | 'manage_permissions'
  | 'view_statistics';

export interface CommunityJoinRequest {
  id: string;
  communityId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
  };
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
