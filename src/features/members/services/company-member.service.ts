import { apiClient } from '../../../api/client'

export interface CompanyMember {
  userId: number
  name: string
  email: string
  roleId: number
  roleTitle: string
  joinedAt: string
}

export interface InviteMemberRequest {
  email: string
  role_id: number
}

export interface InviteMemberResponse {
  message: string
  data: {
    id: number
    email: string
    token?: string
    expiresAt?: string
  }
}

export const companyMemberService = {
  /**
   * GET /companies/:companyId/members
   * Auth required, company membership required.
   * Returns { data: CompanyMember[] }
   */
  getMembers: async (companyId: number | string): Promise<CompanyMember[]> => {
    const response = await apiClient.get<{ data: CompanyMember[] }>(
      `/companies/${companyId}/members`
    )
    return response.data.data
  },

  /**
   * POST /companies/:companyId/invitations
   * Auth required, requires "invite_company_member" permission.
   * Body: { email, role_id }
   * Sends an invitation email to the given address.
   */
  inviteMember: async (
    companyId: number | string,
    data: InviteMemberRequest
  ): Promise<InviteMemberResponse> => {
    const response = await apiClient.post<InviteMemberResponse>(
      `/companies/${companyId}/invitations`,
      data
    )
    return response.data
  },
}
