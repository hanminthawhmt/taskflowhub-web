import { useNavigate } from 'react-router'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function BillingCancelPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 shadow-md shadow-amber-500/10">
            <AlertCircle size={36} />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Checkout Canceled
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          No charges were made. Your workspace remains on its current plan. You can upgrade or manage plans anytime.
        </p>

        <button
          onClick={() => navigate('/dashboard/billing', { replace: true })}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Return to Billing Dashboard
        </button>
      </div>
    </div>
  )
}
