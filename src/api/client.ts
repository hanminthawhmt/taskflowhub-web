import axios from 'axios'

const env = (import.meta as unknown as { env?: Record<string, string> }).env
const API_BASE_URL = env?.VITE_API_BASE_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Centralized Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response

      switch (status) {
        case 401:
          // Unauthorized: Clear token and redirect to login
          localStorage.removeItem('token')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break

        case 403:
          // Forbidden: Insufficient permissions
          console.warn('Forbidden: Insufficient permissions for this action.')
          break

        case 404:
          // Not Found
          console.error('Resource not found.')
          break

        case 500:
          // Internal Server Error
          console.error('Internal server error.')
          break

        default:
          break
      }
    } else if (error.request) {
      // Network error or timeout
      console.error('Network error or server unreachable.')
    }

    return Promise.reject(error)
  }
)
