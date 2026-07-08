import { Navigate, useLocation } from 'react-router-dom'

import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { session, loading } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (loading) return null

  if (session) {
    return <Navigate to={from} replace />
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Repuestos Taller</h1>
        <p className="text-sm text-muted-foreground">Gestión de inventario</p>
      </div>
      <LoginForm redirectTo={from} />
    </div>
  )
}
