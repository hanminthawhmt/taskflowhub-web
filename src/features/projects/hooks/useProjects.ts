import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/project.service'
import type { CreateProjectRequest, AddProjectMemberRequest } from '../types/project'

export function useCompanyProjects(companyId: string) {
  return useQuery({
    queryKey: ['projects', companyId],
    queryFn: () => projectService.getProjects(companyId),
    enabled: !!companyId,
  })
}

export function useProjectDetail(companyId: string, projectId: string) {
  return useQuery({
    queryKey: ['project', companyId, projectId],
    queryFn: () => projectService.getProjectById(companyId, projectId),
    enabled: !!companyId && !!projectId,
  })
}

export function useProjectMembers(companyId: string, projectId: string) {
  return useQuery({
    queryKey: ['project-members', companyId, projectId],
    queryFn: () => projectService.getProjectMembers(companyId, projectId),
    enabled: !!companyId && !!projectId,
  })
}

export function useCreateProjectMutation(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.createProject(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', companyId] })
    },
  })
}

export function useAddProjectMemberMutation(companyId: string, projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AddProjectMemberRequest) =>
      projectService.addProjectMember(companyId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', companyId, projectId] })
    },
  })
}
