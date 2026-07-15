import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import axios from 'axios'

const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormInputs = zod.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setErrorMsg(null)
      await login(data)
    } catch (err: unknown) {
      console.error('Login error caught in UI:', err)
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || 'Login failed. Please verify your credentials.')
      } else {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
        setErrorMsg(msg)
      }
    }
  }

  return (
    <div className="bg-white px-8 py-10 shadow-sm border border-gray-100 rounded-xl dark:bg-gray-800 dark:border-gray-700 w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white">Sign In</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter your email and password to access your dashboard
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            disabled={isLoggingIn}
            {...register('email')}
            className={`mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
              errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password <span className="text-red-500">*</span>
            </label>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            disabled={isLoggingIn}
            {...register('password')}
            className={`mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
              errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
        >
          {isLoggingIn ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          Create account
        </Link>
      </p>
    </div>
  )
}
