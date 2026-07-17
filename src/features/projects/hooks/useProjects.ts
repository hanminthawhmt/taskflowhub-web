import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/project.service'
import type { CreateProjectRequest, AddProjectMemberRequest } from '../types/project'

export function useCompanyProjects(companyId: number | string) {
  return useQuery({
    queryKey: ['projects', companyId],
    queryFn: () => projectService.getProjects(companyId),
    enabled: !!companyId,
  })
}

export function useProjectDetail(companyId: number | string, projectId: number | string) {
  return useQuery({
    queryKey: ['project', companyId, projectId],
    queryFn: () => projectService.getProjectById(companyId, projectId),
    enabled: !!companyId && !!projectId,
  })
}

export function useProjectMembers(companyId: number | string, projectId: number | string) {
  return useQuery({
    queryKey: ['project-members', companyId, projectId],
    queryFn: () => projectService.getProjectMembers(companyId, projectId),
    enabled: !!companyId && !!projectId,
  })
}

export function useCompanyMembers(companyId: number | string) {
  return useQuery({
    queryKey: ['company-members', companyId],
    queryFn: () => projectService.getCompanyMembers(companyId),
    enabled: !!companyId,
  })
}

export function useCreateProjectMutation(companyId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.createProject(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', companyId] })
    },
  })
}

export function useAddProjectMemberMutation(companyId: number | string, projectId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AddProjectMemberRequest) =>
      projectService.addProjectMember(companyId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', companyId, projectId] })
    },
  })
}

export function useDeleteProjectMutation(companyId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: number | string) =>
      projectService.deleteProject(companyId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', companyId] })
    },
  })
}

