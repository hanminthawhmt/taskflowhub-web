import { createBrowserRouter, Navigate } from 'react-router'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ProjectsPage from '../features/projects/pages/ProjectsPage'
import ProjectDetailPage from '../features/projects/pages/ProjectDetailPage'
import MyTasksPage from '../features/tasks/pages/MyTasksPage'
import BillingPage from '../features/billing/pages/BillingPage'
import SettingsPage from '../features/settings/pages/SettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import InvitationPage from '../features/invitations/pages/InvitationPage'
import ProjectInvitationPage from '../features/invitations/pages/ProjectInvitationPage'
import MembersPage from '../features/members/pages/MembersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'projects',
            element: <ProjectsPage />,
          },
          {
            path: 'projects/:projectId',
            element: <ProjectDetailPage />,
          },
          {
            path: 'tasks',
            element: <MyTasksPage />,
          },
          {
            path: 'members',
            element: <MembersPage />,
          },
          {
            path: 'billing',
            element: <BillingPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  // Public invitation acceptance routes — no auth wrapper
  {
    path: 'invitations/company/:token',
    element: <InvitationPage />,
  },
  {
    path: 'invitations/project/:projectId/:token',
    element: <ProjectInvitationPage />,
  },
  {
    path: 'invitations/:token',
    element: <InvitationPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
