import { useMutation } from '@tanstack/react-query'
import { billingService } from '../services/billing.service'

export function usePortalMutation(companyId: string) {
  return useMutation({
    mutationFn: () => billingService.getPortalUrl(companyId),
  })
}

export function useCheckoutMutation(companyId: string) {
  return useMutation({
    mutationFn: (planId: 'starter' | 'pro' | 'enterprise') =>
      billingService.getCheckoutUrl(companyId, planId),
  })
}
