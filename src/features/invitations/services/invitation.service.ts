import axios from 'axios'
import { apiClient } from '../../../api/client'
import type { AuthResponse } from '../../auth/types/auth'

const env = (import.meta as unknown as { env?: Record<string, string> }).env
const API_BASE_URL = env?.VITE_API_BASE_URL || '/api/v1'

// Plain axios instance with NO auth interceptor for public invitation endpoints
const publicClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export interface InvitationInfo {
  email: string
  companyId: number
  userExists: boolean
}

export interface RegisterAndAcceptResponse {
  message: string
  user: {
    id: number
    name: string
    email: string
  }
  token: string
}

export const invitationService = {
  /**
   * GET /companies/invitations/:token
   * Public — no auth required.
   * Returns { data: { email, companyId, userExists } }
   */
  resolveCompanyInvitation: async (token: string): Promise<InvitationInfo> => {
    const response = await publicClient.get<{ data: InvitationInfo }>(
      `/companies/invitations/${token}`
    )
    return response.data.data
  },

  /**
   * POST /companies/invitations/:token/register
   * Public — no auth required. Creates the user and accepts the invitation in one step.
   * Body: { name, password }
   * Response: { message, user, token }
   */
  registerAndAcceptCompanyInvitation: async (
    token: string,
    data: { name: string; password: string }
  ): Promise<RegisterAndAcceptResponse> => {
    const response = await publicClient.post<RegisterAndAcceptResponse>(
      `/companies/invitations/${token}/register`,
      data
    )
    return response.data
  },

  /**
   * POST /companies/invitations/:token/accept
   * Auth required — invitee must already be logged in.
   * No body needed; the backend validates via the URL token + the authenticated user's email.
   */
  acceptCompanyInvitation: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      `/companies/invitations/${token}/accept`
    )
    return response.data
  },

  /**
   * POST /auth/login — re-uses the existing auth service login,
   * but exposed here for the invitation flow to call directly.
   */
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  /**
   * POST /projects/:projectId/invitations/:token/accept
   * Auth required. Accepts a project invitation.
   */
  acceptProjectInvitation: async (
    projectId: number | string,
    token: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      `/projects/${projectId}/invitations/${token}/accept`
    )
    return response.data
  },
}
