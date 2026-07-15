import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/task.service'
import type { CreateTaskRequest, UpdateTaskStatusRequest } from '../types/task'

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getProjectTasks(projectId),
    enabled: !!projectId,
  })
}

export function useMyTasks(projectId: string) {
  return useQuery({
    queryKey: ['my-tasks', projectId],
    queryFn: () => taskService.getMyTasks(projectId),
    enabled: !!projectId,
  })
}

export function useCreateTaskMutation(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks', projectId] })
    },
  })
}

export function useUpdateTaskStatusMutation(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskStatusRequest }) =>
      taskService.updateTaskStatus(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks', projectId] })
    },
  })
}
