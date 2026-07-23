import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { CheckCircle2, ArrowRight, Sparkles, Loader2, CreditCard } from 'lucide-react'
import { useAuthStore } from '../../../store/useAuthStore'
import { useCompanyDetailQuery } from '../../auth/hooks/useAuth'

export default function BillingSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const activeCompany = useAuthStore((s) => s.activeCompany)
  const setActiveCompany = useAuthStore((s) => s.setActiveCompany)
  const companyId = activeCompany?.id || 1

  // Refetch the latest company details from GET /companies/:companyId
  const { data: companyDetail, isLoading } = useCompanyDetailQuery(companyId)

  // Sync updated plan to Zustand auth store
  useEffect(() => {
    if (companyDetail && activeCompany) {
      const updated = {
        ...activeCompany,
        ...companyDetail,
      }
      setActiveCompany(updated)
    }
  }, [companyDetail])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center text-green-500 shadow-md shadow-green-500/10">
            <CheckCircle2 size={36} />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Checkout Returned 🎉
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Stripe checkout completed. Payment confirmation is verified asynchronously by server webhooks.
        </p>

        {sessionId && (
          <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-left">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <CreditCard size={13} />
              <span>Checkout Session Reference</span>
            </div>
            <div className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
              {sessionId}
            </div>
          </div>
        )}

        {companyDetail && (
          <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4 rounded-xl mb-6 text-left flex items-center gap-3">
            <Sparkles size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Current Workspace Plan
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                {companyDetail.planName || 'Updated'} Plan ({companyDetail.subscriptionStatus || 'active'})
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
            <Loader2 size={14} className="animate-spin text-blue-500" />
            Fetching workspace subscription details…
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard/billing', { replace: true })}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
        >
          Go to Billing Dashboard
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
