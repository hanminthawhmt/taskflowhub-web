import { apiClient } from '../../../api/client'

export interface CompanyStats {
  activeProjects: number
  tasksCompleted: number
  pendingTasks: number
  successRate: number
}

export interface WeeklyAnalyticsItem {
  day: string
  completed: number
  created: number
}

export interface ActivityLog {
  id: number
  userId: number
  userName: string
  action: string
  target: string | null
  createdAt: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ActivityLogsResponse {
  data: ActivityLog[]
  pagination: PaginationInfo
}

export interface UpcomingTask {
  id: number
  title: string
  projectTitle: string
  endDate: string
  priority: 'high' | 'medium' | 'low'
}

export const dashboardService = {
  getStats: async (companyId: number | string, period?: 'week' | 'month'): Promise<CompanyStats> => {
    const params: Record<string, string> = {}
    if (period) params.period = period
    const response = await apiClient.get<{ data: CompanyStats }>(`/companies/${companyId}/stats`, { params })
    return response.data.data
  },

  getWeeklyAnalytics: async (companyId: number | string, from?: string, to?: string): Promise<WeeklyAnalyticsItem[]> => {
    const params: Record<string, string> = {}
    if (from) params.from = from
    if (to) params.to = to
    const response = await apiClient.get<{ data: WeeklyAnalyticsItem[] }>(`/companies/${companyId}/analytics/weekly`, { params })
    return response.data.data
  },

  getActivityLogs: async (companyId: number | string, page = 1, limit = 10): Promise<ActivityLogsResponse> => {
    const response = await apiClient.get<ActivityLogsResponse>(`/companies/${companyId}/activity-logs`, {
      params: { page, limit }
    })
    return response.data
  },

  getUpcomingTasks: async (companyId: number | string, days = 7): Promise<UpcomingTask[]> => {
    const response = await apiClient.get<{ data: UpcomingTask[] }>(`/projects/companies/${companyId}/tasks/upcoming`, {
      params: { days }
    })
    return response.data.data
  }
}
