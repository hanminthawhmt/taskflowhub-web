import { apiClient } from '../../../api/client'
import type { Project, ProjectMember, CreateProjectRequest, AddProjectMemberRequest } from '../types/project'

// Helper keys for local mock storage
const PROJECTS_LOCAL_KEY = 'mock_projects'
const MEMBERS_LOCAL_KEY = 'mock_project_members'

const initializeMockData = () => {
  if (!localStorage.getItem(PROJECTS_LOCAL_KEY)) {
    const defaultProjects: Project[] = [
      {
        id: 'proj-default-1',
        title: 'Acme SaaS Frontend',
        description: 'React + Vite UI dashboard redesign project.',
        companyId: 'default-comp',
        ownerId: 'default-owner',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'proj-default-2',
        title: 'Backend API Migration',
        description: 'Migrating Prisma ORM and seeding database structures.',
        companyId: 'default-comp',
        ownerId: 'default-owner',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(PROJECTS_LOCAL_KEY, JSON.stringify(defaultProjects))
  }

  if (!localStorage.getItem(MEMBERS_LOCAL_KEY)) {
    const defaultMembers: Record<string, ProjectMember[]> = {
      'proj-default-1': [
        {
          id: 'mem-1',
          userId: 'usr-1',
          projectId: 'proj-default-1',
          roleId: 'owner',
          user: { name: 'John Doe', email: 'john@saas.com' }
        },
        {
          id: 'mem-2',
          userId: 'usr-2',
          projectId: 'proj-default-1',
          roleId: 'developer',
          user: { name: 'Alice Smith', email: 'alice@saas.com' }
        }
      ],
      'proj-default-2': [
        {
          id: 'mem-3',
          userId: 'usr-1',
          projectId: 'proj-default-2',
          roleId: 'owner',
          user: { name: 'John Doe', email: 'john@saas.com' }
        }
      ]
    }
    localStorage.setItem(MEMBERS_LOCAL_KEY, JSON.stringify(defaultMembers))
  }
}

export const projectService = {
  createProject: async (companyId: string, data: CreateProjectRequest): Promise<Project> => {
    // 1. Real request to backend
    const response = await apiClient.post<{ project: Project }>(`/companies/${companyId}/projects`, data)
    const newProject = response.data.project

    // 2. Sync to local storage for listing
    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    projects.unshift(newProject)
    localStorage.setItem(PROJECTS_LOCAL_KEY, JSON.stringify(projects))

    // Initialize mock members for the new project
    const members: Record<string, ProjectMember[]> = JSON.parse(localStorage.getItem(MEMBERS_LOCAL_KEY) || '{}')

    let currentUserName = 'Workspace Owner'
    let currentUserEmail = 'owner@workspace.com'
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const userObj = JSON.parse(userStr)
        currentUserName = userObj.name || currentUserName
        currentUserEmail = userObj.email || currentUserEmail
      }
    } catch {
      // Silently fall back if local storage has malformed JSON
    }

    members[newProject.id] = [
      {
        id: `mem-new-${Date.now()}`,
        userId: newProject.ownerId || 'usr-current',
        projectId: newProject.id,
        roleId: 'owner',
        user: { name: currentUserName, email: currentUserEmail }
      }
    ]
    localStorage.setItem(MEMBERS_LOCAL_KEY, JSON.stringify(members))

    return newProject
  },

  addProjectMember: async (companyId: string, projectId: string, data: AddProjectMemberRequest): Promise<ProjectMember> => {
    interface MemberResponsePayload {
      id?: string
      user?: {
        name: string
        email: string
      }
    }

    interface AddMemberResponse {
      data?: MemberResponsePayload
      member?: MemberResponsePayload
      id?: string
      user?: {
        name: string
        email: string
      }
    }

    const response = await apiClient.post<AddMemberResponse>(
      `/companies/${companyId}/projects/${projectId}/members`,
      data
    )

    const newMember = response.data.data || response.data.member || response.data

    // 2. Sync to local storage
    initializeMockData()
    const members: Record<string, ProjectMember[]> = JSON.parse(localStorage.getItem(MEMBERS_LOCAL_KEY) || '{}')

    if (!members[projectId]) {
      members[projectId] = []
    }

    const typedMember: ProjectMember = {
      id: newMember.id || `mem-${Date.now()}`,
      userId: data.user_id,
      projectId: projectId,
      roleId: data.role_id,
      user: newMember.user || {
        name: `User ${data.user_id.slice(0, 4)}`,
        email: `user-${data.user_id.slice(0, 4)}@company.com`
      }
    }

    members[projectId].push(typedMember)
    localStorage.setItem(MEMBERS_LOCAL_KEY, JSON.stringify(members))

    return typedMember
  },

  getProjects: async (companyId: string): Promise<Project[]> => {
    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    return projects.filter(p => p.companyId === companyId || p.companyId === 'default-comp')
  },

  getProjectById: async (_companyId: string, projectId: string): Promise<Project> => {
    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    const project = projects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('Project not found')
    }
    return project
  },

  getProjectMembers: async (_companyId: string, projectId: string): Promise<ProjectMember[]> => {
    initializeMockData()
    const members: Record<string, ProjectMember[]> = JSON.parse(localStorage.getItem(MEMBERS_LOCAL_KEY) || '{}')
    return members[projectId] || []
  },

  updateProject: async (_companyId: string, projectId: string, data: Partial<Project>): Promise<Project> => {
    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    const index = projects.findIndex(p => p.id === projectId)
    if (index === -1) {
      throw new Error('Project not found')
    }

    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem(PROJECTS_LOCAL_KEY, JSON.stringify(projects))
    return projects[index]
  },

  deleteProject: async (_companyId: string, projectId: string): Promise<void> => {
    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    const filteredProjects = projects.filter(p => p.id !== projectId)
    localStorage.setItem(PROJECTS_LOCAL_KEY, JSON.stringify(filteredProjects))

    const members: Record<string, ProjectMember[]> = JSON.parse(localStorage.getItem(MEMBERS_LOCAL_KEY) || '{}')
    delete members[projectId]
    localStorage.setItem(MEMBERS_LOCAL_KEY, JSON.stringify(members))
  }
}
