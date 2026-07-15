import { apiClient } from '../../../api/client'
import type { Task, CreateTaskRequest, UpdateTaskStatusRequest } from '../types/task'

const TASKS_LOCAL_KEY = 'mock_project_tasks'

const initializeMockTasks = (projectId: string) => {
  const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
  if (!localStorage.getItem(currentKey)) {
    const defaultTasks: Task[] = [
      {
        id: 'task-default-1',
        title: 'Draft Project Specs',
        description: 'Detailing all functional user requirements and API bindings.',
        priority: 'high',
        status: 'complete',
        start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'usr-1',
        projectId: projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-default-2',
        title: 'Review React Router Settings',
        description: 'Verify sub-route bindings and layouts loading.',
        priority: 'medium',
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'usr-1',
        projectId: projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-default-3',
        title: 'Integrate Stripe Webhooks',
        description: 'Handle event listening for subscription checkout sessions.',
        priority: 'low',
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: 'usr-2',
        projectId: projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(currentKey, JSON.stringify(defaultTasks))
  }
}

export const taskService = {
  createTask: async (projectId: string, data: CreateTaskRequest): Promise<Task> => {
    interface CreateTaskResponse {
      project?: Task
      task?: Task
      id?: string
      createdAt?: string
      updatedAt?: string
    }

    const response = await apiClient.post<CreateTaskResponse>(`/projects/${projectId}/tasks`, data)

    const newTask = response.data?.project || response.data?.task || response.data

    // 2. Sync to local storage
    initializeMockTasks(projectId)
    const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
    const tasks: Task[] = JSON.parse(localStorage.getItem(currentKey) || '[]')

    const fullyFormedTask: Task = {
      id: newTask.id || `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      status: data.status || 'pending',
      start_date: data.start_date,
      end_date: data.end_date,
      user_id: data.user_id,
      projectId: projectId,
      createdAt: newTask.createdAt || new Date().toISOString(),
      updatedAt: newTask.updatedAt || new Date().toISOString()
    }

    tasks.unshift(fullyFormedTask)
    localStorage.setItem(currentKey, JSON.stringify(tasks))

    return fullyFormedTask
  },

  getMyTasks: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get<{ data: Task[] }>(`/projects/${projectId}/tasks/mine`)
    return response.data.data || []
  },

  updateTaskStatus: async (projectId: string, taskId: string, data: UpdateTaskStatusRequest): Promise<Task> => {
    interface UpdateStatusResponse {
      data?: Task
      task?: Task
      id?: string
    }

    const response = await apiClient.patch<UpdateStatusResponse>(
      `/projects/${projectId}/tasks/${taskId}/status`,
      data
    )
    const updatedTask = response.data?.data || response.data?.task
    if (!updatedTask) {
      throw new Error('Malformed API response')
    }

    // 2. Sync to local storage
    initializeMockTasks(projectId)
    const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
    const tasks: Task[] = JSON.parse(localStorage.getItem(currentKey) || '[]')
    const index = tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        status: data.status,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(currentKey, JSON.stringify(tasks))
    }

    return updatedTask
  },

  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    initializeMockTasks(projectId)
    const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
    return JSON.parse(localStorage.getItem(currentKey) || '[]')
  }
}
