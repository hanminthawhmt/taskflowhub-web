import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import axios from 'axios'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { invitationService, type InvitationInfo } from '../services/invitation.service'
import { useAuthStore } from '../../../store/useAuthStore'
import type { Company } from '../../auth/types/auth'

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const registerSchema = zod.object({
  name: zod.string().min(1, 'Full name is required').max(80, 'Name is too long'),
  password: zod
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
})

const loginSchema = zod.object({
  password: zod.string().min(1, 'Password is required'),
})

type RegisterInputs = zod.infer<typeof registerSchema>
type LoginInputs = zod.infer<typeof loginSchema>

// ─── Component ────────────────────────────────────────────────────────────────

type PageState = 'loading' | 'invalid' | 'register' | 'login' | 'success'

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ── Resolve invitation on mount ────────────────────────────────────────────

  useEffect(() => {
    if (!token) {
      setPageState('invalid')
      setResolveError('No invitation token provided.')
      return
    }

    invitationService
      .resolveCompanyInvitation(token)
      .then((info) => {
        setInvitationInfo(info)
        setPageState(info.userExists ? 'login' : 'register')
      })
      .catch((err: unknown) => {
        let msg = 'This invitation link is invalid or has expired.'
        if (axios.isAxiosError(err)) {
          msg = err.response?.data?.message || msg
        }
        setResolveError(msg)
        setPageState('invalid')
      })
  }, [token])

  // ── Register form (new user) ───────────────────────────────────────────────

  const registerForm = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', password: '' },
  })

  const onRegisterSubmit = async (data: RegisterInputs) => {
    if (!token) return
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const result = await invitationService.registerAndAcceptCompanyInvitation(token, {
        name: data.name,
        password: data.password,
      })

      // Build a minimal User + Company from the response and log the user in
      const user = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      }
      // We know which company from the resolved info
      const company: Company | undefined = invitationInfo?.companyId
        ? { id: invitationInfo.companyId, name: 'Your Workspace' }
        : undefined

      setAuth(user, result.token, company)
      setPageState('success')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1800)
    } catch (err: unknown) {
      let msg = 'Failed to create your account. Please try again.'
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg
      }
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Login form (existing user) ─────────────────────────────────────────────

  const loginForm = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  })

  const onLoginSubmit = async (data: LoginInputs) => {
    if (!token || !invitationInfo) return
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      // Step 1: Log in with the pre-filled email + user-entered password
      const loginResult = await invitationService.login({
        email: invitationInfo.email,
        password: data.password,
      })

      // Persist auth state immediately so apiClient picks up the new token
      const user = loginResult.user || { id: 0, name: 'User', email: invitationInfo.email }
      const loginToken = loginResult.token || ''

      // Store token in localStorage NOW — apiClient reads from localStorage per request
      localStorage.setItem('token', loginToken)

      // Step 2: Accept the invitation (auth required)
      await invitationService.acceptCompanyInvitation(token)

      // Step 3: Finalize auth state in Zustand + navigate
      const company: Company | undefined = loginResult.company ?? (invitationInfo.companyId
        ? { id: invitationInfo.companyId, name: 'Your Workspace' }
        : undefined)

      setAuth(user, loginToken, company)
      setPageState('success')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1800)
    } catch (err: unknown) {
      // Clean up the early-stored token if anything went wrong
      localStorage.removeItem('token')
      let msg = 'Something went wrong. Please check your password and try again.'
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg
      }
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const emailDisplay = invitationInfo?.email ?? ''

  // ─── States ─────────────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return <InvitationShell><LoadingState /></InvitationShell>
  }

  if (pageState === 'invalid') {
    return (
      <InvitationShell>
        <InvalidState message={resolveError ?? 'This invitation is invalid or has expired.'} />
      </InvitationShell>
    )
  }

  if (pageState === 'success') {
    return <InvitationShell><SuccessState /></InvitationShell>
  }

  return (
    <InvitationShell>
      <div className="bg-white dark:bg-gray-800 px-8 py-10 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl w-full">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Building2 size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">
            {pageState === 'register' ? 'Create your account' : 'Accept your invitation'}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {pageState === 'register'
              ? "You've been invited to join a workspace. Set up your account to get started."
              : "You've been invited to join a workspace. Log in to accept."}
          </p>
        </div>

        {/* Error banner */}
        {submitError && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg dark:bg-red-950/30 dark:border-red-900 dark:text-red-400 flex items-start gap-2">
            <XCircle size={16} className="mt-0.5 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Email — always read-only, pre-filled */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email Address
          </label>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed select-none">
            <ShieldCheck size={14} className="shrink-0 text-blue-500" />
            <span className="truncate">{emailDisplay}</span>
            <span className="ml-auto text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              pre-filled
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            This email matches your invitation and cannot be changed.
          </p>
        </div>

        {/* ─── Branch A: Register (new user) ─────────────────────────────── */}
        {pageState === 'register' && (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                disabled={isSubmitting}
                {...registerForm.register('name')}
                className={`mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
                  registerForm.formState.errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {registerForm.formState.errors.name && (
                <p className="mt-1.5 text-xs text-red-500">
                  {registerForm.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  disabled={isSubmitting}
                  {...registerForm.register('password')}
                  className={`block w-full px-4 py-2.5 pr-10 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
                    registerForm.formState.errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {registerForm.formState.errors.password && (
                <p className="mt-1.5 text-xs text-red-500">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account & join workspace
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── Branch B: Login (existing user) ───────────────────────────── */}
        {pageState === 'login' && (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your account password"
                  disabled={isSubmitting}
                  {...loginForm.register('password')}
                  className={`block w-full px-4 py-2.5 pr-10 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
                    loginForm.formState.errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="mt-1.5 text-xs text-red-500">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign in & accept invitation
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </InvitationShell>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function InvitationShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      {/* Logo bar */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          T
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Task Flow Hub
        </span>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="bg-white dark:bg-gray-800 px-8 py-16 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl w-full text-center">
      <Loader2 size={36} className="animate-spin text-blue-500 mx-auto mb-4" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Verifying your invitation…
      </p>
    </div>
  )
}

function InvalidState({ message }: { message: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 px-8 py-14 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl w-full text-center">
      <div className="flex justify-center mb-5">
        <XCircle size={48} className="text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Invitation not found
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
        {message}
      </p>
      <a
        href="/login"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        Go to login
        <ArrowRight size={15} />
      </a>
    </div>
  )
}

function SuccessState() {
  return (
    <div className="bg-white dark:bg-gray-800 px-8 py-14 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl w-full text-center">
      <div className="flex justify-center mb-5">
        <CheckCircle2 size={48} className="text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        You're in! 🎉
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
        Invitation accepted. Redirecting you to your workspace…
      </p>
      <div className="mt-6">
        <Loader2 size={20} className="animate-spin text-blue-500 mx-auto" />
      </div>
    </div>
  )
}
