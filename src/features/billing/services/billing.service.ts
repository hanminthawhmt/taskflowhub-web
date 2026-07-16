import { apiClient } from '../../../api/client'

export interface Plan {
  id: number
  name: string
  price: number // in satang
  maxProjects: number | null
}

export const billingService = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await apiClient.get<{ data: Plan[] }>('/billing/plans')
    return response.data.data
  },

  getPortalUrl: async (companyId: number | string): Promise<string> => {
    const response = await apiClient.get<{ url: string }>(`/companies/${companyId}/billing/portal`)
    return response.data.url
  },

  getCheckoutUrl: async (companyId: number | string, planId: number): Promise<string> => {
    const response = await apiClient.post<{ url: string }>(`/companies/${companyId}/checkout`, {
      plan_id: planId,
    })
    return response.data.url
  },
}
