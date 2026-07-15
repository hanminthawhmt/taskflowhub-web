import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useAuthStore } from '../../../store/useAuthStore'
import { User, Shield, Building } from 'lucide-react'
import { toast } from 'sonner'

// Schemas
const profileSchema = zod.object({
  name: zod.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
})

const passwordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Current password is required'),
  newPassword: zod.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: zod.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const workspaceSchema = zod.object({
  companyName: zod.string().min(1, 'Workspace name is required').max(100, 'Name is too long'),
})

type ProfileInputs = zod.infer<typeof profileSchema>
type PasswordInputs = zod.infer<typeof passwordSchema>
type WorkspaceInputs = zod.infer<typeof workspaceSchema>

export default function SettingsPage() {
  const user = useAuthStore(state => state.user)
  const activeCompany = useAuthStore(state => state.activeCompany)
  const setAuth = useAuthStore(state => state.setAuth)
  const setActiveCompany = useAuthStore(state => state.setActiveCompany)

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'workspace'>('profile')

  // Forms
  const profileForm = useForm<ProfileInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  const passwordForm = useForm<PasswordInputs>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const workspaceForm = useForm<WorkspaceInputs>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      companyName: activeCompany?.name || '',
    },
  })

  // Submit Handlers
  const onProfileSubmit = (data: ProfileInputs) => {
    if (user) {
      const updatedUser = { ...user, name: data.name, email: data.email }
      const token = localStorage.getItem('token') || ''
      setAuth(updatedUser, token, activeCompany || undefined)
      toast.success('Profile updated successfully (Mock Synced)')
    }
  }

  const onPasswordSubmit = () => {
    passwordForm.reset()
    toast.success('Password updated successfully (Mock Synced)')
  }

  const onWorkspaceSubmit = (data: WorkspaceInputs) => {
    if (activeCompany) {
      const updatedCompany = { ...activeCompany, name: data.companyName }
      localStorage.setItem('activeCompany', JSON.stringify(updatedCompany))
      setActiveCompany(updatedCompany)
      toast.success('Workspace settings updated successfully (Mock Synced)')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Account Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal profile, secure credentials, and active workspace preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Tab Links */}
        <div className="md:col-span-1 flex flex-row md:flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-3 md:pb-0 md:pr-4">
          {(
            [
              { id: 'profile', name: 'My Profile', icon: User },
              { id: 'password', name: 'Security', icon: Shield },
              { id: 'workspace', name: 'Workspace', icon: Building },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Panels */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-6">

          {/* Profile details */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Details</h3>
                <p className="text-xs text-slate-450">Update your account name and email address configurations.</p>
              </div>

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Full Name</label>
                  <input
                    type="text"
                    {...profileForm.register('name')}
                    className={`mt-1.5 block w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white ${
                      profileForm.formState.errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    {...profileForm.register('email')}
                    className={`mt-1.5 block w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white ${
                      profileForm.formState.errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer shadow-sm shadow-blue-500/10"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security & Password */}
          {activeTab === 'password' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Password</h3>
                <p className="text-xs text-slate-450">Change your secret credentials to prevent unauthorized account accesses.</p>
              </div>

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...passwordForm.register('currentPassword')}
                    className={`mt-1.5 block w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white ${
                      passwordForm.formState.errors.currentPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...passwordForm.register('newPassword')}
                    className={`mt-1.5 block w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white ${
                      passwordForm.formState.errors.newPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...passwordForm.register('confirmPassword')}
                    className={`mt-1.5 block w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white ${
                      passwordForm.formState.errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer shadow-sm shadow-blue-500/10"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workspace Settings */}
          {activeTab === 'workspace' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Workspace Preferences</h3>
                <p className="text-xs text-slate-450">Manage names and settings for your current company context.</p>
              </div>

              <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Workspace / Company Name</label>
                  <input
                    type="text"
                    {...workspaceForm.register('companyName')}
                    className={`mt-1.5 block w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-900 dark:text-white ${
                      workspaceForm.formState.errors.companyName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {workspaceForm.formState.errors.companyName && (
                    <p className="mt-1 text-xs text-red-500">{workspaceForm.formState.errors.companyName.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer shadow-sm shadow-blue-500/10"
                  >
                    Update Workspace
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
