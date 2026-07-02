import type { AuthSession } from '../types'

async function postAuth(path: string, body: unknown): Promise<AuthSession> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const message =
      (await res.json().catch(() => null))?.message ?? 'Something went wrong.'
    throw new Error(message)
  }
  return (await res.json()) as AuthSession
}

export function login(email: string, password: string): Promise<AuthSession> {
  return postAuth('/api/auth/login', { email, password })
}

export function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthSession> {
  return postAuth('/api/auth/register', { name, email, password })
}
