import { useAuthStore } from '../../../store/useAuthStore'
import { usePortalMutation, useCheckoutMutation } from '../hooks/useBilling'
import { Check, CreditCard, Sparkles, Building } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

export default function BillingPage() {
  const activeCompany = useAuthStore((state) => state.activeCompany)
  const setActiveCompany = useAuthStore((state) => state.setActiveCompany)

  const companyId = activeCompany?.id || 'default-comp'
  const currentTier = activeCompany?.tier || 'free'

  const portalMutation = usePortalMutation(companyId)
  const checkoutMutation = useCheckoutMutation(companyId)

  const handlePortalRedirect = async () => {
    try {
      const url = await portalMutation.mutateAsync()
      window.location.assign(url)
    } catch {
      toast.warning('Stripe Billing Portal is not active in this sandbox. Resetting workspace to Free locally.')
      if (activeCompany) {
        const updated = { ...activeCompany, tier: 'free' as const }
        localStorage.setItem('activeCompany', JSON.stringify(updated))
        setActiveCompany(updated)
      }
    }
  }

  const handleUpgrade = async (planId: 'starter' | 'pro' | 'enterprise') => {
    try {
      const url = await checkoutMutation.mutateAsync(planId)
      window.location.assign(url)
    } catch (err: unknown) {
      let isPermissionError = false
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        isPermissionError = true
      }

      if (isPermissionError) {
        toast.error('Only the workspace owner can manage billing subscriptions.')
      } else {
        toast.success(`Stripe checkout not active. Simulating upgrade to ${planId} locally...`)
        if (activeCompany) {
          const updated = { ...activeCompany, tier: planId }
          localStorage.setItem('activeCompany', JSON.stringify(updated))
          setActiveCompany(updated)
        }
      }
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Workspace',
      price: '$0',
      description: 'Standard task scheduling for small personal projects.',
      features: ['3 active projects', '15 task cards total', 'Basic activity boards'],
    },
    {
      id: 'starter',
      name: 'Starter Tier',
      price: '$19',
      description: 'Collaborate and coordinate with small team members.',
      features: [
        '10 active projects',
        '100 task cards total',
        'Workspace member invitations',
        'Medium priority tags',
      ],
    },
    {
      id: 'pro',
      name: 'Professional Tier',
      price: '$49',
      description: 'Advanced workspace automation and assignee validation.',
      features: [
        'Unlimited projects',
        'Unlimited task cards',
        'Assignee role validations',
        'High priority tags',
        'Personal checklist logs',
      ],
    },
  ]

  const isLoading = portalMutation.isPending || checkoutMutation.isPending

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

        {/* Current status display card */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/50 px-5 py-3.5 rounded-xl flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Current Workspace Plan</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-0.5">{currentTier} Tier</p>
          </div>
        </div>
      </div>

      {/* Stripe portal redirection bar */}
      {currentTier !== 'free' && (
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

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan) => {
          const isActive = currentTier === plan.id
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 py-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-50 dark:border-slate-800/60">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                {plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-850 text-slate-400 text-xs font-semibold rounded-lg border border-transparent"
                  >
                    Included In Core
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id as 'starter' | 'pro' | 'enterprise')}
                    disabled={isActive || isLoading}
                    className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50'
                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50 border border-transparent'
                    } disabled:opacity-50`}
                  >
                    {isActive ? 'Current Plan' : `Upgrade to ${plan.id}`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
