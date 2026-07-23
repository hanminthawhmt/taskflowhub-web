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
      // Refresh the members list after a successful invite
      queryClient.invalidateQueries({ queryKey: ['company-members', companyId] })
    },
  })
}
