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
    const response = await apiClient.get<any>(`/companies/${companyId}/billing/portal`)
    const portalUrl =
      response.data?.url ||
      response.data?.checkoutUrl ||
      response.data?.data?.url ||
      response.data?.data?.checkoutUrl

    if (!portalUrl) {
      throw new Error('No portal URL returned by the server.')
    }
    return portalUrl
  },

  getCheckoutUrl: async (companyId: number | string, planId: number): Promise<string> => {
    const response = await apiClient.post<any>(`billing/companies/${companyId}/checkout`, {
      plan_id: planId,
    })
    const checkoutUrl =
      response.data?.checkoutUrl ||
      response.data?.url ||
      response.data?.data?.checkoutUrl ||
      response.data?.data?.url

    if (!checkoutUrl) {
      throw new Error('No checkout URL returned by the server.')
    }
    return checkoutUrl
  },
}
