export interface Task {
  id: number | string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'complete'
  startDate?: string | null
  endDate?: string | null
  assignee?: {
    id: number
    name: string
    email: string
  } | null
  user_id?: number | string
  projectId: number | string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: 'high' | 'medium' | 'low'
  status?: 'pending' | 'complete'
  start_date?: string
  end_date?: string
  user_id?: number | string
}

export interface UpdateTaskStatusRequest {
  status: 'pending' | 'complete'
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: 'high' | 'medium' | 'low'
  start_date?: string
  end_date?: string
  user_id?: number
}
