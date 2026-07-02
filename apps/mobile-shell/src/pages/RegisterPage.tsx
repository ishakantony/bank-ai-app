import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AuthField } from '../components/auth/AuthField'
import { PrimaryButton } from '../components/PrimaryButton'
import { register } from '../api/auth'
import { useAuthStore } from '../store/authStore'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) return toast.error('Tell us your name.')
    if (!EMAIL_RE.test(email)) return toast.error('Enter a valid email address.')
    if (password.length < 6)
      return toast.error('Password must be at least 6 characters.')

    setSubmitting(true)
    try {
      // Register auto-signs-in — the returned session lands you on the home.
      const session = await register(name, email, password)
      setSession(session)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Open your Bank AI account in seconds"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-1 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Full name"
          icon={User}
          value={name}
          onChange={setName}
          placeholder="Aisyah Rahman"
          autoComplete="name"
          name="name"
        />
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          name="password"
        />
        <PrimaryButton type="submit" loading={submitting} className="mt-1">
          {submitting ? 'Creating account…' : 'Create account'}
        </PrimaryButton>
      </form>
    </AuthLayout>
  )
}
