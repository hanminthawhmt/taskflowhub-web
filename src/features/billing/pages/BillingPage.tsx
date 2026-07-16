import { useAuthStore } from '../../../store/useAuthStore'
import { usePortalMutation, useCheckoutMutation, usePlansQuery } from '../hooks/useBilling'
import { Check, CreditCard, Sparkles, Building } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

export default function BillingPage() {
  const activeCompany = useAuthStore((state) => state.activeCompany)
  const setActiveCompany = useAuthStore((state) => state.setActiveCompany)

  const companyId = activeCompany?.id || 1
  const currentPlanId = activeCompany?.planId || 1
  const currentPlanName = activeCompany?.planName || 'Free'
  const currentStatus = activeCompany?.subscriptionStatus || 'active'

  const { data: apiPlans, isLoading: loadingPlans } = usePlansQuery()
  const portalMutation = usePortalMutation(companyId)
  const checkoutMutation = useCheckoutMutation(companyId)

  const handlePortalRedirect = async () => {
    try {
      const url = await portalMutation.mutateAsync()
      window.location.assign(url)
    } catch {
      toast.warning('Stripe Billing Portal is not active in this sandbox. Resetting workspace to Free locally.')
      if (activeCompany) {
        const updated = {
          ...activeCompany,
          planId: 1,
          planName: 'Free',
          subscriptionStatus: 'active'
        }
        localStorage.setItem('activeCompany', JSON.stringify(updated))
        setActiveCompany(updated)
      }
    }
  }

  const handleUpgrade = async (plan: { id: number; name: string }) => {
    try {
      const url = await checkoutMutation.mutateAsync(plan.id)
      window.location.assign(url)
    } catch (err: unknown) {
      let isPermissionError = false
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        isPermissionError = true
      }

      if (isPermissionError) {
        toast.error('Only the workspace owner can manage billing subscriptions.')
      } else {
        toast.success(`Stripe checkout not active. Simulating upgrade to ${plan.name} locally...`)
        if (activeCompany) {
          const updated = {
            ...activeCompany,
            planId: plan.id,
            planName: plan.name,
            subscriptionStatus: 'active'
          }
          localStorage.setItem('activeCompany', JSON.stringify(updated))
          setActiveCompany(updated)
        }
      }
    }
  }

  // Fallback plans metadata descriptions & features
  const planDetails: Record<string, { description: string; features: string[] }> = {
    free: {
      description: 'Standard task scheduling for small personal projects.',
      features: ['1 active project allowed', 'Kanban task tracking boards', 'Standard priority lists'],
    },
    starter: {
      description: 'Collaborate and coordinate with small team members.',
      features: [
        'Up to 5 active projects',
        'Workspace member invitations',
        'Shared board assignees',
        'Medium priority tags',
      ],
    },
    pro: {
      description: 'Advanced workspace automation and assignee validation.',
      features: [
        'Up to 20 active projects',
        'Advanced workflow tools',
        'High priority tags',
        'Personal checklist logs',
      ],
    },
    business: {
      description: 'Enterprise grade performance and unlimited scoping.',
      features: [
        'Unlimited projects',
        'Priority support SLA',
        'Custom security configurations',
        'Dedicated server options',
      ],
    },
  }

  const isLoading = loadingPlans || portalMutation.isPending || checkoutMutation.isPending

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <CreditCard className="text-blue-600 dark:text-blue-400" />
            <span>Billing & Workspace Subscription</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your corporate workspace plans, billing intervals, and payment methods.
          </p>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/50 px-5 py-3.5 rounded-xl flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Current Workspace Plan</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-0.5">{currentPlanName} Plan ({currentStatus})</p>
          </div>
        </div>
      </div>

      {currentPlanId !== 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <Building size={16} />
            <span>Manage invoices, edit payment profiles, or cancel subscription using secure Stripe Portal link.</span>
          </div>
          <button
            onClick={handlePortalRedirect}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
          >
            {portalMutation.isPending ? 'Redirecting...' : 'Stripe Billing Portal'}
          </button>
        </div>
      )}

      {loadingPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-6 h-80 bg-slate-50/50 dark:bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          {apiPlans?.map((plan) => {
            const isActive = currentPlanId === plan.id
            const planKey = plan.name.toLowerCase()
            const meta = planDetails[planKey] || {
              description: 'Workspace plan tier.',
              features: [`Max projects: ${plan.maxProjects ?? 'Unlimited'}`, 'Standard access'],
            }

            const displayPrice = plan.price === 0 ? '฿0' : `฿${(plan.price / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/10'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Active
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{meta.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 py-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{displayPrice}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-slate-50 dark:border-slate-800/60">
                    {meta.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  {plan.id === 1 ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-transparent"
                    >
                      Included In Core
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={isActive || isLoading}
                      className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50'
                          : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50 border border-transparent'
                      } disabled:opacity-50`}
                    >
                      {isActive ? 'Current Plan' : `Upgrade`}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
