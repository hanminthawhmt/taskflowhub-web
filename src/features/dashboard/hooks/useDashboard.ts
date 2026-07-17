import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'

export function useCompanyStats(companyId: number | string, period?: 'week' | 'month') {
  return useQuery({
    queryKey: ['dashboard-stats', companyId, period],
    queryFn: () => dashboardService.getStats(companyId, period),
    enabled: !!companyId,
  })
}

export function useWeeklyAnalytics(companyId: number | string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['dashboard-weekly-analytics', companyId, from, to],
    queryFn: () => dashboardService.getWeeklyAnalytics(companyId, from, to),
    enabled: !!companyId,
  })
}

export function useActivityLogs(companyId: number | string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['dashboard-activity-logs', companyId, page, limit],
    queryFn: () => dashboardService.getActivityLogs(companyId, page, limit),
    enabled: !!companyId,
  })
}

export function useUpcomingTasks(companyId: number | string, days = 7) {
  return useQuery({
    queryKey: ['dashboard-upcoming-tasks', companyId, days],
    queryFn: () => dashboardService.getUpcomingTasks(companyId, days),
    enabled: !!companyId,
  })
}
