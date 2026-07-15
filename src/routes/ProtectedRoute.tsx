import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../store/useAuthStore'

interface ProtectedRouteProps {
  redirectPath?: string
}

export default function ProtectedRoute({ redirectPath = '/login' }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}
