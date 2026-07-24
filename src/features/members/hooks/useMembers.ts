import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyMemberService, type InviteMemberRequest } from '../services/company-member.service'

export function useCompanyMembersQuery(companyId: number | string) {
  return useQuery({
    queryKey: ['company-members', companyId],
    queryFn: () => companyMemberService.getMembers(companyId),
    enabled: !!companyId,
  })
}

export function useInviteMemberMutation(companyId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InviteMemberRequest) =>
      companyMemberService.inviteMember(companyId, data),
    onSuccess: () => {
      // Refresh members & invitations list
      queryClient.invalidateQueries({ queryKey: ['company-members', companyId] })
      queryClient.invalidateQueries({ queryKey: ['company-invitations', companyId] })
    },
  })
}

export function useCompanyPendingInvitationsQuery(companyId: number | string) {
  return useQuery({
    queryKey: ['company-invitations', companyId],
    queryFn: () => companyMemberService.getPendingInvitations(companyId),
    enabled: !!companyId,
  })
}

export function useRevokeCompanyInvitationMutation(companyId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: number | string) =>
      companyMemberService.revokeInvitation(companyId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-invitations', companyId] })
    },
  })
}
