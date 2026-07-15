export interface Project {
  id: string
  title: string
  description?: string
  companyId: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  userId: string
  projectId: string
  roleId: string
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
  user_id: string
  role_id: string
}
