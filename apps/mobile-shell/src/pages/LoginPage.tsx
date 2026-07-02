import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AuthField } from '../components/auth/AuthField'
import { PrimaryButton } from '../components/PrimaryButton'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) return toast.error('Enter a valid email address.')
    if (password.length < 1) return toast.error('Enter your password.')

    setSubmitting(true)
    try {
      const session = await login(email, password)
      setSession(session)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Bank AI account"
      footer={
        <>
          New to Bank AI?{' '}
          <Link
            to="/register"
            className="font-semibold text-brand-1 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          name="email"
        />
        <AuthField
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          name="password"
        />
        <PrimaryButton type="submit" loading={submitting} className="mt-1">
          {submitting ? 'Signing in…' : 'Sign in'}
        </PrimaryButton>
        <p className="text-center text-xs text-ink-soft">
          Demo: any email, password{' '}
          <span className="font-semibold text-ink">password</span>
        </p>
      </form>
    </AuthLayout>
  )
}
