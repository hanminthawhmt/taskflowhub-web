import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import axios from 'axios'
import {
  FolderKanban,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  LogIn,
  ShieldCheck,
} from 'lucide-react'
import { invitationService } from '../services/invitation.service'
import { useAuthStore } from '../../../store/useAuthStore'

export default function ProjectInvitationPage() {
  const { projectId, token } = useParams<{ projectId: string; token: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Save redirect location if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectTo', location.pathname)
    }
  }, [isAuthenticated, location.pathname])

  if (!projectId || !token) {
    return (
      <InvitationShell>
        <div className="bg-white dark:bg-gray-800 px-8 py-14 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl w-full text-center">
          <div className="flex justify-center mb-5">
            <XCircle size={48} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid invitation link
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
            The project invitation link is missing required parameters.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            Go to dashboard
            <ArrowRight size={15} />
          </button>
        </div>
      </InvitationShell>
    )
  }

  const handleAccept = async () => {
    setErrorMsg(null)
    setIsSubmitting(true)
    try {
      await invitationService.acceptProjectInvitation(projectId, token)
      setIsSuccess(true)
      setTimeout(() => {
        navigate(`/dashboard/projects/${projectId}`, { replace: true })
      }, 1500)
    } catch (err: unknown) {
      let msg = 'Failed to accept project invitation. The token may be invalid or expired.'
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg
      }
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <InvitationShell>
        <div className="bg-white dark:bg-gray-800 px-8 py-10 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FolderKanban size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">
            Project Invitation
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            You've been invited to join a project. Please sign in to your account to accept this invitation.
          </p>

          <div className="mt-8">
            <button
              onClick={() => {
                sessionStorage.setItem('redirectTo', location.pathname)
                navigate('/login')
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <LogIn size={16} />
              Sign in to accept
            </button>
          </div>
        </div>
      </InvitationShell>
    )
  }

  // Success view
  if (isSuccess) {
    return (
      <InvitationShell>
        <div className="bg-white dark:bg-gray-800 px-8 py-14 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl w-full text-center">
          <div className="flex justify-center mb-5">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Joined Project! 🎉
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Invitation accepted successfully. Redirecting to your project…
          </p>
          <div className="mt-6">
            <Loader2 size={20} className="animate-spin text-blue-500 mx-auto" />
          </div>
        </div>
      </InvitationShell>
    )
  }

  // Authenticated view - ready to accept
  return (
    <InvitationShell>
      <div className="bg-white dark:bg-gray-800 px-8 py-10 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl w-full">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FolderKanban size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">
            Accept Project Invitation
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You've been invited to collaborate on project #{projectId}.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg dark:bg-red-950/30 dark:border-red-900 dark:text-red-400 flex items-start gap-2">
            <XCircle size={16} className="mt-0.5 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Signed in as
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-500 shrink-0" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.name || user?.email}
            </span>
            <span className="text-xs text-slate-500 truncate">({user?.email})</span>
          </div>
        </div>

        <button
          onClick={handleAccept}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              Accept Invitation
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </InvitationShell>
  )
}

function InvitationShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          T
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          TaskSaaS
        </span>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
