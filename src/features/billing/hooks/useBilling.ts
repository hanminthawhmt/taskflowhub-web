import { useMutation, useQuery } from '@tanstack/react-query'
import { billingService } from '../services/billing.service'

export function usePlansQuery() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billingService.getPlans(),
  })
}

export function usePortalMutation(companyId: number | string) {
  return useMutation({
    mutationFn: () => billingService.getPortalUrl(companyId),
  })
}

export function useCheckoutMutation(companyId: number | string) {
  return useMutation({
    mutationFn: (planId: number) =>
      billingService.getCheckoutUrl(companyId, planId),
  })
}
