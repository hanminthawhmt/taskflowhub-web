import { apiClient } from '../../../api/client'
import type { Project, ProjectMember, CreateProjectRequest, AddProjectMemberRequest } from '../types/project'

const PROJECTS_LOCAL_KEY = 'mock_projects'
const MEMBERS_LOCAL_KEY = 'mock_project_members'

const initializeMockData = () => {
  if (!localStorage.getItem(PROJECTS_LOCAL_KEY)) {
    const defaultProjects: Project[] = [
      {
        id: 10001,
        title: 'Acme SaaS Frontend',
        description: 'React + Vite UI dashboard redesign project.',
        companyId: 1,
        ownerId: 3,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 10002,
        title: 'Backend API Migration',
        description: 'Migrating Prisma ORM and seeding database structures.',
        companyId: 1,
        ownerId: 3,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(PROJECTS_LOCAL_KEY, JSON.stringify(defaultProjects))
  }

  if (!localStorage.getItem(MEMBERS_LOCAL_KEY)) {
    const defaultMembers: Record<string, ProjectMember[]> = {
      '10001': [
        {
          id: 20001,
          userId: 3,
          projectId: 10001,
          roleId: 1,
          roleTitle: 'Owner',
          user: { name: 'Han Min', email: 'han@example.com' }
        },
        {
          id: 20002,
          userId: 7,
          projectId: 10001,
          roleId: 2,
          roleTitle: 'Developer',
          user: { name: 'Jane Doe', email: 'jane@doe.com' }
        }
      ],
      '10002': [
        {
          id: 20003,
          userId: 3,
          projectId: 10002,
          roleId: 1,
          roleTitle: 'Owner',
          user: { name: 'Han Min', email: 'han@example.com' }
        }
      ]
    }
    localStorage.setItem(MEMBERS_LOCAL_KEY, JSON.stringify(defaultMembers))
  }
}

export const projectService = {
  createProject: async (companyId: number | string, data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post<{ project: Project }>(`/companies/${companyId}/projects`, data)
    const newProject = response.data.project

    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    projects.unshift(newProject)
    localStorage.setItem(PROJECTS_LOCAL_KEY, JSON.stringify(projects))

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
      // fallback silently
    }

    members[newProject.id] = [
      {
        id: Date.now(),
        userId: newProject.ownerId || 3,
        projectId: newProject.id,
        roleId: 1,
        roleTitle: 'Owner',
        user: { name: currentUserName, email: currentUserEmail }
      }
    ]
    localStorage.setItem(MEMBERS_LOCAL_KEY, JSON.stringify(members))

    return newProject
  },

  addProjectMember: async (companyId: number | string, projectId: number | string, data: AddProjectMemberRequest): Promise<ProjectMember> => {
    interface AddMemberResponse {
      data?: {
        id?: number
        roleTitle?: string
        user?: { name: string; email: string }
        name?: string
        email?: string
      }
      member?: {
        id?: number
        roleTitle?: string
        user?: { name: string; email: string }
        name?: string
        email?: string
      }
      id?: number
      roleTitle?: string
      user?: { name: string; email: string }
      name?: string
      email?: string
    }

    const response = await apiClient.post<AddMemberResponse>(
      `/companies/${companyId}/projects/${projectId}/members`,
      data
    )
    const newMember = response.data.data || response.data.member || response.data

    initializeMockData()
    const members: Record<string, ProjectMember[]> = JSON.parse(localStorage.getItem(MEMBERS_LOCAL_KEY) || '{}')

    const pIdStr = String(projectId)
    if (!members[pIdStr]) {
      members[pIdStr] = []
    }

    const typedMember: ProjectMember = {
      id: Number(newMember.id) || Date.now(),
      userId: Number(data.user_id),
      projectId: Number(projectId),
      roleId: Number(data.role_id) || data.role_id,
      roleTitle: newMember.roleTitle || 'Developer',
      user: newMember.user || {
        name: newMember.name || `User ${data.user_id}`,
        email: newMember.email || `user-${data.user_id}@company.com`
      }
    }

    members[pIdStr].push(typedMember)
    localStorage.setItem(MEMBERS_LOCAL_KEY, JSON.stringify(members))

    return typedMember
  },

  getProjects: async (companyId: number | string): Promise<Project[]> => {
    try {
      const response = await apiClient.get<{ data: Project[] }>(`/companies/${companyId}/projects`)
      return response.data.data
    } catch (err) {
      console.warn('GET /companies/:id/projects failed, falling back to mock projects list:', err)
      initializeMockData()
      const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
      return projects.filter(p => Number(p.companyId) === Number(companyId) || p.companyId === 1)
    }
  },

  getProjectById: async (_companyId: number | string, projectId: number | string): Promise<Project> => {
    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    const project = projects.find(p => Number(p.id) === Number(projectId))
    if (!project) {
      throw new Error('Project not found')
    }
    return project
  },

  getProjectMembers: async (companyId: number | string, projectId: number | string): Promise<ProjectMember[]> => {
    initializeMockData()
    const members: Record<string, ProjectMember[]> = JSON.parse(localStorage.getItem(MEMBERS_LOCAL_KEY) || '{}')
    const membersList = members[String(projectId)]
    if (membersList) return membersList

    // If project member route is missing, fallback to company members list
    const compMembers = await projectService.getCompanyMembers(companyId)
    return compMembers.map(m => ({
      ...m,
      projectId: Number(projectId)
    }))
  },

  getCompanyMembers: async (companyId: number | string): Promise<ProjectMember[]> => {
    interface CompanyMemberPayload {
      userId: number
      name: string
      email: string
      roleId: number | string
      roleTitle?: string
    }

    try {
      const response = await apiClient.get<{ data: CompanyMemberPayload[] }>(`/companies/${companyId}/members`)
      return response.data.data.map((m, idx) => ({
        id: Number(m.userId) || idx,
        userId: Number(m.userId),
        projectId: 0,
        roleId: Number(m.roleId) || m.roleId,
        roleTitle: m.roleTitle,
        user: { name: m.name, email: m.email }
      }))
    } catch (err) {
      console.warn('GET /companies/:id/members failed, returning mock members list:', err)
      return [
        { id: 3, userId: 3, projectId: 0, roleId: 1, roleTitle: 'Owner', user: { name: 'Han Min', email: 'han@example.com' } },
        { id: 7, userId: 7, projectId: 0, roleId: 2, roleTitle: 'Developer', user: { name: 'Jane Doe', email: 'jane@doe.com' } }
      ]
    }
  },

  updateProject: async (_companyId: number | string, projectId: number | string, data: Partial<Project>): Promise<Project> => {
    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    const index = projects.findIndex(p => Number(p.id) === Number(projectId))
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

  deleteProject: async (_companyId: number | string, projectId: number | string): Promise<void> => {
    initializeMockData()
    const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_LOCAL_KEY) || '[]')
    const filteredProjects = projects.filter(p => Number(p.id) !== Number(projectId))
    localStorage.setItem(PROJECTS_LOCAL_KEY, JSON.stringify(filteredProjects))

    const members: Record<string, ProjectMember[]> = JSON.parse(localStorage.getItem(MEMBERS_LOCAL_KEY) || '{}')
    delete members[String(projectId)]
    localStorage.setItem(MEMBERS_LOCAL_KEY, JSON.stringify(members))
  }
}
