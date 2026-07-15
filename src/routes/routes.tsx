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
import NotFoundPage from '../pages/NotFoundPage'

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
            path: 'billing',
            element: <BillingPage />,
          },
          {
            path: 'settings',
            element: (
              <div className="p-6 bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-800 m-6">
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="mt-1 text-sm text-slate-500">Account settings feature will be implemented in Phase 5.</p>
              </div>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
