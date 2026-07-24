import { apiClient } from '../../../api/client'
import type { Task, CreateTaskRequest, UpdateTaskStatusRequest, UpdateTaskRequest } from '../types/task'

const TASKS_LOCAL_KEY = 'mock_project_tasks'

const initializeMockTasks = (projectId: number | string) => {
  const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
  if (!localStorage.getItem(currentKey)) {
    const defaultTasks: Task[] = [
      {
        id: 14001,
        title: 'Draft Project Specs',
        description: 'Detailing all functional user requirements and API bindings.',
        priority: 'high',
        status: 'complete',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        assignee: { id: 3, name: 'Han Min', email: 'han@example.com' },
        projectId: Number(projectId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 14002,
        title: 'Review React Router Settings',
        description: 'Verify sub-route bindings and layouts loading.',
        priority: 'medium',
        status: 'pending',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignee: { id: 3, name: 'Han Min', email: 'han@example.com' },
        projectId: Number(projectId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 14003,
        title: 'Integrate Stripe Webhooks',
        description: 'Handle event listening for subscription checkout sessions.',
        priority: 'low',
        status: 'pending',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignee: { id: 7, name: 'Jane Doe', email: 'jane@doe.com' },
        projectId: Number(projectId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(currentKey, JSON.stringify(defaultTasks))
  }
}

export const taskService = {
  createTask: async (projectId: number | string, data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<unknown>(`/projects/${projectId}/tasks`, data)
    const resBody = response.data as Record<string, unknown>
    let newTask = resBody
    if (resBody && typeof resBody === 'object') {
      if (resBody.project) {
        newTask = resBody.project as Record<string, unknown>
      } else if (resBody.task) {
        newTask = resBody.task as Record<string, unknown>
      } else if (resBody.data) {
        newTask = resBody.data as Record<string, unknown>
      }
    }

    initializeMockTasks(projectId)
    const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
    const tasks: Task[] = JSON.parse(localStorage.getItem(currentKey) || '[]')

    const fullyFormedTask: Task = {
      id: Number(newTask.id) || Date.now(),
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      status: data.status || 'pending',
      startDate: data.start_date || null,
      endDate: data.end_date || null,
      assignee: (newTask.assignee as { id: number; name: string; email: string } | undefined) || null,
      user_id: Number(data.user_id) || data.user_id,
      projectId: Number(projectId),
      createdAt: String(newTask.createdAt || new Date().toISOString()),
      updatedAt: String(newTask.updatedAt || new Date().toISOString())
    }

    tasks.unshift(fullyFormedTask)
    localStorage.setItem(currentKey, JSON.stringify(tasks))

    return fullyFormedTask
  },

  getMyTasks: async (projectId: number | string): Promise<Task[]> => {
    try {
      const response = await apiClient.get<{ data: Task[] }>(`/projects/${projectId}/mine`)
      return response.data.data || []
    } catch (err) {
      console.warn('GET /projects/:projectId/mine failed, returning local storage subset:', err)
      initializeMockTasks(projectId)
      const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
      const tasks: Task[] = JSON.parse(localStorage.getItem(currentKey) || '[]')

      let currentUserId = 3
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          currentUserId = JSON.parse(userStr).id || currentUserId
        }
      } catch {
        // fallback
      }
      return tasks.filter(t => t.assignee?.id === currentUserId)
    }
  },

  updateTaskStatus: async (projectId: number | string, taskId: number | string, data: UpdateTaskStatusRequest): Promise<Task> => {
    const response = await apiClient.patch<unknown>(
      `/projects/${projectId}/tasks/${taskId}/status`,
      data
    )
    const resBody = response.data as Record<string, unknown>
    const updatedTask = (resBody?.data || resBody?.task || resBody) as unknown as Task

    initializeMockTasks(projectId)
    const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
    const tasks: Task[] = JSON.parse(localStorage.getItem(currentKey) || '[]')
    const index = tasks.findIndex(t => Number(t.id) === Number(taskId))
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

  updateTask: async (projectId: number | string, taskId: number | string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.patch<{ message: string; data: Task }>(
      `/projects/${projectId}/tasks/${taskId}`,
      data
    )
    return response.data.data
  },

  deleteTask: async (projectId: number | string, taskId: number | string): Promise<void> => {
    await apiClient.delete<{ message: string }>(`/projects/${projectId}/tasks/${taskId}`)
  },

  getProjectTasks: async (projectId: number | string): Promise<Task[]> => {
    try {
      const response = await apiClient.get<{ data: Task[] }>(`/projects/${projectId}/tasks`)
      return response.data.data
    } catch (err) {
      console.warn('GET /projects/:projectId/tasks failed, falling back to mock tasks list:', err)
      initializeMockTasks(projectId)
      const currentKey = `${TASKS_LOCAL_KEY}_${projectId}`
      return JSON.parse(localStorage.getItem(currentKey) || '[]')
    }
  }
}
