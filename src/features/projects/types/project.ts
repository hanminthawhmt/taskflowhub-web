export interface Project {
  id: number
  title: string
  description?: string
  companyId: number
  ownerId?: number
  memberCount?: number
  taskCount?: number
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: number
  userId: number
  projectId: number
  roleId: number | string
  roleTitle?: string
  user: {
    name: string;
    email: string;
  }
}

export interface CreateProjectRequest {
  title: string
  description?: string
}

export interface AddProjectMemberRequest {
  user_id: number | string
  role_id: number | string
}

export interface PendingInvitation {
  id: number
  email: string
  roleId: number
  roleTitle: string
  invitedBy: {
    id: number
    name: string
    email: string
  }
  expiresAt: string
  createdAt: string
}
