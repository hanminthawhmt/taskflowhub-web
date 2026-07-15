import { apiClient } from '../../../api/client'

export const billingService = {
  getPortalUrl: async (companyId: string): Promise<string> => {
    const response = await apiClient.get<{ url: string }>(`/companies/${companyId}/billing/portal`)
    return response.data.url
  },

  getCheckoutUrl: async (companyId: string, planId: 'starter' | 'pro' | 'enterprise'): Promise<string> => {
    const response = await apiClient.post<{ url: string }>(`/companies/${companyId}/billing/checkout`, {
      plan_id: planId,
    })
    return response.data.url
  },
}
