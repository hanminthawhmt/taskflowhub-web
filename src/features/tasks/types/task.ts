export interface Task {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'complete'
  start_date?: string
  end_date?: string
  user_id?: string
  projectId: string
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
  user_id?: string
}

export interface UpdateTaskStatusRequest {
  status: 'pending' | 'complete'
}
