import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import {
  UserPlus,
  Search,
  Users,
  Mail,
  Shield,
  Clock,
  X,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  Crown,
  HelpCircle,
  Download,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useAuthStore } from '../../../store/useAuthStore'
import {
  useCompanyMembersQuery,
  useInviteMemberMutation,
  useCompanyPendingInvitationsQuery,
  useRevokeCompanyInvitationMutation,
} from '../hooks/useMembers'
import type { CompanyMember } from '../services/company-member.service'
import { exportToCSV } from '../../../utils/csvExport'

// ─── Seeded company role IDs (scope: "company") ──────────────────────────────
// 1=Owner, 2=Admin, 3=Manager, 4=Member, 5=Guest
const COMPANY_ROLES = [
  { id: 4, label: 'Member' },
  { id: 3, label: 'Manager' },
  { id: 2, label: 'Admin' },
  { id: 5, label: 'Guest' },
] as const

// ─── Invite form schema ────────────────────────────────────────────────────────
const inviteSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Enter a valid email address'),
  role_id: zod.enum(['2', '3', '4', '5']),
})
type InviteInputs = zod.infer<typeof inviteSchema>

// ─── Role badge colour mapping ─────────────────────────────────────────────────
const roleBadgeClass: Record<string, string> = {
  Owner:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  Admin:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
  Manager:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  Member:
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Guest:
    'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Avatar colours (deterministic by userId) ─────────────────────────────────
const AVATAR_COLOURS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
]
function avatarColour(userId: number) {
  return AVATAR_COLOURS[userId % AVATAR_COLOURS.length]
}

// ─── MembersPage ──────────────────────────────────────────────────────────────

export default function MembersPage() {
  const activeCompany = useAuthStore((s) => s.activeCompany)
  const currentUser = useAuthStore((s) => s.user)
  const companyId = activeCompany?.id ?? 1

  const { data: members, isLoading, isError, refetch } = useCompanyMembersQuery(companyId)
  const { data: pendingInvitations, isLoading: invitesLoading } = useCompanyPendingInvitationsQuery(companyId)
  const inviteMutation = useInviteMemberMutation(companyId)
  const revokeMutation = useRevokeCompanyInvitationMutation(companyId)

  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [rolesGuideOpen, setRolesGuideOpen] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteInputs>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role_id: '4' }, // Member by default
  })

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered: CompanyMember[] = (members ?? []).filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Invite submit ──────────────────────────────────────────────────────────
  const onInviteSubmit = async (data: InviteInputs) => {
    setInviteError(null)
    try {
      await inviteMutation.mutateAsync({
        email: data.email,
        role_id: Number(data.role_id),
      })
      toast.success(`Invitation sent to ${data.email}`)
      reset()
      setModalOpen(false)
    } catch (err: unknown) {
      let msg = 'Failed to send invitation. Please try again.'
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? msg
      }
      setInviteError(msg)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setInviteError(null)
    reset()
  }

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Unable to load members
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          We couldn't fetch the member list. Check your connection or try again.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    )
  }

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Members
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {activeCompany?.name ?? 'Your workspace'} ·{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {members?.length ?? 0} {members?.length === 1 ? 'member' : 'members'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              if (!members || members.length === 0) return
              exportToCSV(
                members.map((m) => ({
                  Name: m.name,
                  Email: m.email,
                  Role: m.roleTitle,
                  JoinedAt: new Date(m.joinedAt).toLocaleDateString(),
                })),
                `${activeCompany?.name || 'Workspace'}_Members`
              )
              toast.success('Members list exported to CSV')
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download size={15} />
            Export CSV
          </button>

          <button
            onClick={() => setRolesGuideOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle size={15} />
            Roles Guide
          </button>

          <button
            id="invite-member-btn"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/20 cursor-pointer shrink-0"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Members',
            value: members?.length ?? 0,
            icon: Users,
            colour: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
          },
          {
            label: 'Owners',
            value: members?.filter((m) => m.roleTitle === 'Owner').length ?? 0,
            icon: Crown,
            colour: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
          },
          {
            label: 'Admins',
            value: members?.filter((m) => m.roleTitle === 'Admin').length ?? 0,
            icon: Shield,
            colour: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400',
          },
          {
            label: 'Managers',
            value: members?.filter((m) => m.roleTitle === 'Manager').length ?? 0,
            icon: Shield,
            colour: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm"
            >
              <div className={`inline-flex p-2 rounded-lg mb-3 ${stat.colour}`}>
                <Icon size={16} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs Switcher: Members vs Pending Invitations */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'members'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users size={16} />
          <span>Active Members</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {members?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'invitations'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Send size={16} />
          <span>Pending Invitations</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold">
            {pendingInvitations?.length || 0}
          </span>
        </button>
      </div>

      {activeTab === 'members' ? (
        /* Search + table card */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">

        {/* Search bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name, email or role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
            />
          </div>
        </div>

        {/* Members list */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No members match your search.' : 'No members yet.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
              >
                Invite your first member
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((member) => {
              const isCurrentUser = member.userId === currentUser?.id
              const badgeClass = roleBadgeClass[member.roleTitle] ?? roleBadgeClass['Member']

              return (
                <li
                  key={member.userId}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`h-10 w-10 rounded-full ${avatarColour(member.userId)} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}
                  >
                    {getInitials(member.name)}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail size={11} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {member.email}
                      </span>
                    </div>
                  </div>

                  {/* Role badge */}
                  <span
                    className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border shrink-0 ${badgeClass}`}
                  >
                    {member.roleTitle === 'Owner' && <Crown size={10} />}
                    {member.roleTitle}
                  </span>

                  {/* Joined date */}
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 shrink-0 min-w-[110px]">
                    <Clock size={11} />
                    <span>Joined {formatDate(member.joinedAt)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      ) : (
        /* Pending Invitations Table Card */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Send size={18} className="text-blue-500" />
                <span>Pending Workspace Invitations</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Outstanding invitation emails sent to future team members.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Send New Invite</span>
            </button>
          </div>

          {invitesLoading ? (
            <div className="space-y-3 animate-pulse py-4">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
          ) : pendingInvitations && pendingInvitations.length > 0 ? (
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Invitee Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Invited By</th>
                    <th className="py-3 px-4">Sent Date</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingInvitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <span>{inv.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {inv.roleTitle}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {inv.invitedBy?.name || inv.invitedBy?.email || 'Admin'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Revoke invitation for ${inv.email}?`)) return
                            try {
                              await revokeMutation.mutateAsync(inv.id)
                              toast.success('Invitation revoked')
                            } catch {
                              toast.error('Failed to revoke invitation')
                            }
                          }}
                          disabled={revokeMutation.isPending}
                          className="px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No pending invitations found for this workspace.
            </div>
          )}
        </div>
      )}

      {/* ─── Invite Modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <Send size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Invite to workspace
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    They'll receive an email with a link to join.
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit(onInviteSubmit)} className="px-6 py-5 space-y-5">

              {/* Error banner */}
              {inviteError && (
                <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg dark:text-red-400">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {inviteError}
                </div>
              )}

              {/* Email field */}
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    disabled={inviteMutation.isPending}
                    {...register('email')}
                    className={`block w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:text-white ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Role field */}
              <div>
                <label
                  htmlFor="invite-role"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Workspace role <span className="text-red-500">*</span>
                </label>
                <select
                  id="invite-role"
                  disabled={inviteMutation.isPending}
                  {...register('role_id')}
                  className="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white disabled:opacity-50"
                >
                  {COMPANY_ROLES.map((role) => (
                    <option key={role.id} value={String(role.id)}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  Owner and Admin roles have full workspace access.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={inviteMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {inviteMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─── Roles & Permissions Guide Modal ─────────────────────────────────── */}
      {rolesGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Shield className="text-blue-600 dark:text-blue-400" size={20} />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Workspace Roles & Permissions
                </h3>
              </div>
              <button
                onClick={() => setRolesGuideOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {[
                {
                  role: 'Owner',
                  badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
                  desc: 'Full workspace ownership. Can manage billing subscriptions, project settings, invite & remove members, and promote admins.',
                  permissions: ['Manage Billing & Stripe', 'Create & Delete Projects', 'Invite Workspace Members', 'Edit Workspace Settings'],
                },
                {
                  role: 'Admin',
                  badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400',
                  desc: 'Administrative access across workspace projects and members, excluding core Stripe billing ownership.',
                  permissions: ['Create & Edit Projects', 'Invite Workspace Members', 'Manage Project Members', 'View Workspace Analytics'],
                },
                {
                  role: 'Manager',
                  badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
                  desc: 'Project leadership role. Can create projects, add existing team members, and assign task priorities.',
                  permissions: ['Create Projects', 'Add Project Members', 'Assign Tasks & Priorities', 'View Activity Logs'],
                },
                {
                  role: 'Member',
                  badge: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
                  desc: 'Standard team collaborator. Can create, track, and update task statuses across assigned projects.',
                  permissions: ['Create Tasks', 'Update Task Statuses', 'Comment & Track Assigned Tasks'],
                },
                {
                  role: 'Guest',
                  badge: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900 dark:text-gray-400',
                  desc: 'Limited access collaborator restricted to assigned project boards only.',
                  permissions: ['View Assigned Tasks', 'Update Task Statuses'],
                },
              ].map((r) => (
                <div key={r.role} className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${r.badge}`}>
                      {r.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{r.desc}</p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {r.permissions.map((p) => (
                      <div key={p} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Check size={12} className="text-green-500 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
